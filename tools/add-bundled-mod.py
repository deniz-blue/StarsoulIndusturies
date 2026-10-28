#!/usr/bin/env python3
import hashlib
import re
import shutil
import sys
import urllib.parse
from pathlib import Path

from pack_site import URL

REPO = Path(__file__).resolve().parent.parent
BUNDLED = REPO / "files"
MODS = REPO / "packwiz" / "mods"
SIDES = {"client", "server", "both"}


def main():
    if len(sys.argv) != 4 or sys.argv[3] not in SIDES:
        raise SystemExit("usage: add-bundled-mod.py <jar> <name> <client|server|both>")
    jar, name, side = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    metafile = MODS / f"{slug}.pw.toml"
    if metafile.exists():
        old = re.search(r'^url = ".*/files/(.+)"$', metafile.read_text(encoding="utf-8"), re.M)
        if old and urllib.parse.unquote(old[1]) != jar.name:
            (BUNDLED / urllib.parse.unquote(old[1])).unlink(missing_ok=True)
    BUNDLED.mkdir(exist_ok=True)
    shutil.copy(jar, BUNDLED / jar.name)
    metafile.write_text(
        f'name = "{name}"\n'
        f'filename = "{jar.name}"\n'
        f'side = "{side}"\n'
        "\n[download]\n"
        f'url = "{URL}/files/{urllib.parse.quote(jar.name)}"\n'
        'hash-format = "sha512"\n'
        f'hash = "{hashlib.sha512(jar.read_bytes()).hexdigest()}"\n',
        encoding="utf-8",
    )
    print(metafile.relative_to(REPO))


main()
