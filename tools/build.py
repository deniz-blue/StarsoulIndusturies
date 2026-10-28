#!/usr/bin/env python3
import base64
import gzip
import hashlib
import json
import re
import shutil
import tomllib
import zipfile
from pathlib import Path, PurePosixPath

from pack_site import URL
from png_to_qoi import encode_qoi, read_png_rgba, resize_nearest

REPO = Path(__file__).resolve().parent.parent
PACKWIZ = REPO / "packwiz"
DIST = REPO / "distribution"
SITE = REPO / "site"
BUNDLED = REPO / "files"
BUILD = REPO / "build"
NAME = "StarsoulIndusturies"
FILLED_SUFFIXES = {".cfg", ".html", ".ini", ".json"}
UPDATER_ICON_SIZE = 64



pack = tomllib.loads((PACKWIZ / "pack.toml").read_text(encoding="utf-8"))
unsup_patch = json.loads((DIST / "prism" / "patches" / "com.unascribed.unsup.json").read_text(encoding="utf-8"))
if pack["versions"].get("unsup") != unsup_patch["version"]:
    raise SystemExit(f"pack.toml [versions] unsup must be {unsup_patch['version']}, the Prism patch version: unsup copies it into Prism's components")
icon_key = re.search(r"^iconKey=(.+)$", (DIST / "prism" / "instance.cfg").read_text(encoding="utf-8"), re.M)[1]
icon = DIST / "prism" / f"{icon_key}.png"
placeholder_values = {
    "name": pack["name"],
    "version": pack["version"],
    "minecraft": pack["versions"]["minecraft"],
    "neoforge": pack["versions"]["neoforge"],
    "unsup": unsup_patch["version"],
    "url": URL,
    "icon_qoi": base64.b64encode(gzip.compress(encode_qoi(*resize_nearest(*read_png_rgba(icon), UPDATER_ICON_SIZE)), mtime=0)).decode(),
}


def filled_bytes(path):
    data = path.read_bytes()
    if path.suffix not in FILLED_SUFFIXES:
        return data

    def value(match):
        if match[1] not in placeholder_values:
            raise SystemExit(f"unknown {match[0]} in {path}")
        return placeholder_values[match[1]]

    return re.sub(r"\{\{(\w+)\}\}", value, data.decode()).encode()


def write_filled(source, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(filled_bytes(source))


def files_in(folder):
    return [path for path in sorted(folder.rglob("*")) if path.is_file()]


def copy_folder_filled(folder, target):
    for path in files_in(folder):
        write_filled(path, target / path.relative_to(folder))


def zip_layers(archive, layers):
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for source, target in layers:
            if source.is_file():
                zip_file.writestr(target, filled_bytes(source))
                continue
            for path in files_in(source):
                zip_file.writestr(str(PurePosixPath(target) / path.relative_to(source).as_posix()), filled_bytes(path))


def require_packwiz_hash(path, hash_format, expected_hash):
    if not path.is_file() or hashlib.new(hash_format, path.read_bytes()).hexdigest() != expected_hash:
        raise SystemExit(f"{path.relative_to(REPO).as_posix()} does not match the packwiz index, run packwiz refresh inside packwiz/")


def copy_packwiz():
    index_file = pack["index"]["file"]
    require_packwiz_hash(PACKWIZ / index_file, pack["index"]["hash-format"], pack["index"]["hash"])
    index = tomllib.loads((PACKWIZ / index_file).read_text(encoding="utf-8"))
    for entry in index["files"]:
        require_packwiz_hash(PACKWIZ / entry["file"], entry.get("hash-format", index["hash-format"]), entry["hash"])
    for name in ["pack.toml", "unsup.toml", index_file, *(entry["file"] for entry in index["files"])]:
        target = BUILD / "packwiz" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(PACKWIZ / name, target)


shutil.rmtree(BUILD, ignore_errors=True)
BUILD.mkdir()
copy_packwiz()
shutil.copytree(BUNDLED, BUILD / "files")
copy_folder_filled(SITE, BUILD)

game_folder = DIST / "game-folder"
relauncher = DIST / "relauncher"
zip_layers(BUILD / f"{NAME}-Prism.zip", [(DIST / "prism", ""), (game_folder, ".minecraft")])
zip_layers(BUILD / f"{NAME}.mrpack", [(DIST / "mrpack", ""), (game_folder, "overrides"), (relauncher, "overrides"), (icon, "overrides/icon.png")])
zip_layers(BUILD / f"{NAME}-CurseForge.zip", [(DIST / "curseforge", ""), (game_folder, "overrides"), (relauncher, "overrides")])

write_filled(icon, BUILD / "icon.png")
write_filled(game_folder / "unsup.ini", BUILD / "unsup.ini")
write_filled(relauncher / "unsup.jar", BUILD / "unsup.jar")
shutil.copy(relauncher / "mods" / "starsoul-early-fixes.jar", BUILD / "files")
write_filled(DIST / "server" / "unsup.ini", BUILD / "server" / "unsup.ini")

print(f"built {BUILD}")
