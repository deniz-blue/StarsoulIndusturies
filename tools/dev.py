#!/usr/bin/env python3
"""Local development for the pack.

    dev.py check [--pushing]   index, versions and dependencies, no game
    dev.py serve               build, serve on localhost and rebuild on change, with a Prism dev instance
    dev.py boot                headless client and server boot, then KubeJS script errors
"""

import argparse
import hashlib
import http.server
import io
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import tomllib
import urllib.request
import zipfile
from functools import partial
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PACKWIZ = REPO / "packwiz"
BUILD = REPO / "build"
WORK = Path.home() / ".cache" / "starsoul-dev"
PRISM_INSTANCES = Path.home() / ".local" / "share" / "PrismLauncher" / "instances"
DEV_INSTANCE = "Starsoul-dev"
DEV_PORT = 8000
WATCHED = [PACKWIZ, REPO / "distribution", REPO / "site", REPO / "files", REPO / "tools"]
SIDE_FOLDERS = {"client": ["client"], "server": ["server"], "both": ["client", "server"]}
ALWAYS_THERE = {"minecraft", "neoforge", "forge", "java", "javafml", "lowcodefml", "kotlinforforge"}
MOD_METADATA = ("META-INF/neoforge.mods.toml", "META-INF/mods.toml")


def run(command, **options):
    return subprocess.run(command, check=True, **options)


def read_toml(path):
    return tomllib.loads(path.read_text(encoding="utf-8"))


def pack_toml():
    return read_toml(PACKWIZ / "pack.toml")


def digest(path, algorithm):
    return hashlib.new(algorithm, path.read_bytes()).hexdigest()


def metafiles():
    index = read_toml(PACKWIZ / "index.toml")
    for entry in index["files"]:
        if entry["file"].startswith("mods/") and entry.get("metafile"):
            path = PACKWIZ / entry["file"]
            yield path.name.removesuffix(".pw.toml"), read_toml(path)


def flavor_metafiles():
    unsup = PACKWIZ / "unsup.toml"
    if not unsup.exists():
        return {}
    choices = {}
    for name, entry in read_toml(unsup).get("metafile", {}).items():
        flavors = entry.get("flavors", [])
        choices[name] = [flavors] if isinstance(flavors, str) else flavors
    return choices


def fetch_jar(metafile):
    source = metafile["download"]
    bundled = REPO / "files" / metafile["filename"]
    if bundled.exists():
        return bundled
    cache = WORK / "jars"
    cache.mkdir(parents=True, exist_ok=True)
    jar = cache / metafile["filename"]
    if jar.exists() and digest(jar, source["hash-format"]) == source["hash"]:
        return jar
    url = source.get("url")
    if not url:
        raise SystemExit(f"{metafile['name']} has no download url; put {metafile['filename']} in {cache}")
    request = urllib.request.Request(url, headers={"User-Agent": "starsoul-dev"})
    with urllib.request.urlopen(request, timeout=120) as answer:
        jar.write_bytes(answer.read())
    if digest(jar, source["hash-format"]) != source["hash"]:
        jar.unlink()
        raise SystemExit(f"hash mismatch: {metafile['filename']}")
    return jar


def jars_by_side(without=()):
    sides = {"client": [], "server": []}
    for name, metafile in metafiles():
        if name in without or not metafile["filename"].endswith(".jar"):
            continue
        jar = fetch_jar(metafile)
        for side in SIDE_FOLDERS[metafile.get("side", "both")]:
            sides[side].append(jar)
    bundled = [path for path in (PACKWIZ / "mods").glob("*.jar")]
    sides["client"] += bundled
    sides["server"] += bundled
    return sides


def mod_metadata(archive):
    names = set(archive.namelist())
    for name in MOD_METADATA:
        if name in names:
            try:
                return tomllib.loads(archive.read(name).decode("utf-8", errors="replace"))
            except tomllib.TOMLDecodeError:
                return {}
    return {}


def fabric_metadata(archive):
    if "fabric.mod.json" not in archive.namelist():
        return {}
    try:
        return json.loads(archive.read("fabric.mod.json").decode("utf-8", errors="replace"), strict=False)
    except json.JSONDecodeError:
        return {}


def nested_jars(archive):
    names = set(archive.namelist())
    paths = {name for name in names if name.startswith("META-INF/jarjar/") and name.endswith(".jar")}
    if "META-INF/jarjar/metadata.json" in names:
        paths |= {jar["path"] for jar in json.loads(archive.read("META-INF/jarjar/metadata.json")).get("jars", [])}
    paths |= {jar["file"] for jar in fabric_metadata(archive).get("jars", [])}
    return paths & names


def jar_version(archive):
    manifest = archive.read("META-INF/MANIFEST.MF").decode(errors="replace") if "META-INF/MANIFEST.MF" in archive.namelist() else ""
    found = re.search(r"^Implementation-Version:\s*(\S+)", manifest, re.M)
    return found[1] if found else None


def provided_mods(archive):
    provided = {}
    for mod in mod_metadata(archive).get("mods", []):
        version = str(mod.get("version", ""))
        if "${" in version:
            version = jar_version(archive) or ""
        provided[mod.get("modId")] = version
    fabric = fabric_metadata(archive)
    for mod_id in [fabric.get("id"), *fabric.get("provides", [])]:
        provided[mod_id] = str(fabric.get("version", ""))
    for path in nested_jars(archive):
        with zipfile.ZipFile(io.BytesIO(archive.read(path))) as nested:
            for mod_id, version in provided_mods(nested).items():
                provided.setdefault(mod_id, version)
    provided.pop(None, None)
    return provided


def version_key(version):
    return [[(0, int(part), "") if part.isdigit() else (1, 0, part) for part in re.split(r"[._]", segment) if part]
            for segment in version.split("+")[0].split("-")]


def in_range(version, version_range):
    version_range = version_range.strip()
    if not version_range or version_range in ("*", "any") or not version:
        return True
    if version_range[0] not in "[(":
        return version_key(version) >= version_key(version_range)
    low, _, high = (bound.strip().strip("*") for bound in version_range[1:-1].partition(","))
    key = version_key(version)
    if low and (key < version_key(low) or (version_range[0] == "(" and key == version_key(low))):
        return False
    if high and (key > version_key(high) or (version_range[-1] == ")" and key == version_key(high))):
        return False
    return True


def dependency_problems(jars, side):
    provided, needs = {mod: "" for mod in ALWAYS_THERE}, []
    for jar in jars:
        with zipfile.ZipFile(jar) as archive:
            provided |= provided_mods(archive)
            for owner, dependencies in mod_metadata(archive).get("dependencies", {}).items():
                for dependency in dependencies if isinstance(dependencies, list) else []:
                    kind = dependency.get("type", "required" if dependency.get("mandatory", True) else "optional").lower()
                    if kind in ("required", "optional") and dependency.get("side", "BOTH").upper() in ("BOTH", side.upper()):
                        needs.append((jar.name, owner, kind, dependency.get("modId"), dependency.get("versionRange", "")))
    problems = []
    for jar, owner, kind, mod_id, version_range in needs:
        if mod_id in ALWAYS_THERE:
            continue
        if mod_id not in provided:
            if kind == "required":
                problems.append(f"{owner} ({jar}) requires {mod_id}, which is missing")
        elif not in_range(provided[mod_id], version_range):
            problems.append(f"{owner} ({jar}) wants {mod_id} {version_range}, has {provided[mod_id]}")
    return problems


def check(pushing):
    problems = []
    run(["packwiz", "refresh"], cwd=PACKWIZ, stdout=subprocess.DEVNULL)
    if pushing:
        dirty = subprocess.run(["git", "status", "--porcelain", "--", "packwiz"], cwd=REPO, capture_output=True, text=True).stdout
        if dirty.strip():
            problems.append("packwiz/ has uncommitted changes after packwiz refresh:\n" + dirty.rstrip())
    pack = pack_toml()
    patch = json.loads((REPO / "distribution" / "prism" / "patches" / "com.unascribed.unsup.json").read_text(encoding="utf-8"))
    if pack["versions"].get("unsup") != patch["version"]:
        problems.append(f"pack.toml [versions] unsup is {pack['versions'].get('unsup')}, the Prism patch has {patch['version']}")
    flavored = flavor_metafiles()
    sets = [("everything on", ())]
    if flavored:
        sets.append(("every flavor off", tuple(flavored)))
    for label, without in sets:
        sides = jars_by_side(without)
        for side, jars in sides.items():
            if label != "everything on" and side == "server":
                continue
            problems += [f"{side}, {label}: {problem}" for problem in dependency_problems(jars, side)]
    for problem in problems:
        print(problem)
    print("check: ok" if not problems else f"check: {len(problems)} problem(s)")
    return not problems


def build(url=None):
    environment = dict(os.environ, **({"PACK_URL": url} if url else {}))
    run([sys.executable, str(REPO / "tools" / "build.py")], env=environment, stdout=subprocess.DEVNULL)


def newest_change():
    return max((path.stat().st_mtime for folder in WATCHED for path in folder.rglob("*") if path.is_file() and "__pycache__" not in path.parts), default=0)


def install_dev_instance():
    target = PRISM_INSTANCES / DEV_INSTANCE
    if target.exists():
        return target
    with zipfile.ZipFile(BUILD / "StarsoulIndusturies-Prism.zip") as archive:
        archive.extractall(target)
    config = target / "instance.cfg"
    config.write_text(re.sub(r"^name=.*$", f"name={DEV_INSTANCE}", config.read_text(encoding="utf-8"), flags=re.M), encoding="utf-8")
    return target


def serve():
    url = f"http://localhost:{DEV_PORT}"
    build(url)
    instance = install_dev_instance()
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(BUILD))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", DEV_PORT), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    print(f"serving {BUILD} on {url}; Prism instance {DEV_INSTANCE} at {instance} reads from it")
    print(f"launch it with: prismlauncher --launch {DEV_INSTANCE}  (restart Prism once if it does not list it yet)")
    seen = newest_change()
    while True:
        time.sleep(1)
        latest = newest_change()
        if latest != seen:
            seen = latest
            try:
                build(url)
                print(time.strftime("%H:%M:%S"), "rebuilt")
            except subprocess.CalledProcessError:
                print(time.strftime("%H:%M:%S"), "build failed, serving the last good one")


def boot():
    neoforge = pack_toml()["versions"]["neoforge"]
    WORK.mkdir(parents=True, exist_ok=True)
    sides = jars_by_side(tuple(flavor_metafiles()))
    for side, jars in sides.items():
        mods = WORK / side / "mods"
        shutil.rmtree(mods, ignore_errors=True)
        mods.mkdir(parents=True)
        for jar in jars:
            shutil.copy(jar, mods / jar.name)
        for folder in ("config", "kubejs", "defaultconfigs"):
            shutil.rmtree(WORK / side / folder, ignore_errors=True)
            if (PACKWIZ / folder).exists():
                shutil.copytree(PACKWIZ / folder, WORK / side / folder)
    run(["bash", str(REPO / "tools" / "boot-server.sh"), str(WORK / "server"), neoforge])
    boot_client = os.environ.get("BOOT_CLIENT")
    if boot_client:
        run(["bash", boot_client, str(WORK), neoforge])
    else:
        print("boot: client skipped, set BOOT_CLIENT to a client boot script")
    errors = []
    for side in ("client", "server"):
        for log in (WORK / side / "logs" / "kubejs").glob("*.log"):
            errors += [f"{side} {log.name}: {line}" for line in log.read_text(errors="replace").splitlines() if "[ERROR]" in line]
    for line in errors:
        print(line)
    print("boot: KubeJS clean" if not errors else f"boot: {len(errors)} KubeJS error line(s)")
    return not errors


def main():
    sys.stdout.reconfigure(line_buffering=True)
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    commands = parser.add_subparsers(dest="command", required=True)
    check_command = commands.add_parser("check")
    check_command.add_argument("--pushing", action="store_true")
    commands.add_parser("serve")
    commands.add_parser("boot")
    arguments = parser.parse_args()
    if arguments.command == "check":
        sys.exit(0 if check(arguments.pushing) else 1)
    if arguments.command == "serve":
        serve()
    if arguments.command == "boot":
        sys.exit(0 if boot() else 1)


if __name__ == "__main__":
    main()
