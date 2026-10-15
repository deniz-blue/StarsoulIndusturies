#!/bin/sh
set -e
cd "$(dirname "$0")"
libs="${XDG_CACHE_HOME:-$HOME/.cache}/starsoul-early-fixes"
mkdir -p "$libs"
fetch() { [ -f "$libs/$2" ] || curl -sfLo "$libs/$2" "$1/$2"; }
fetch https://maven.neoforged.net/releases/cpw/mods/modlauncher/11.0.5 modlauncher-11.0.5.jar
fetch https://repo1.maven.org/maven2/org/apache/logging/log4j/log4j-api/2.22.1 log4j-api-2.22.1.jar
rm -rf classes
javac --release 21 -d classes -cp "$libs/modlauncher-11.0.5.jar:$libs/log4j-api-2.22.1.jar" $(find src -name '*.java')
cp -r META-INF classes/
printf 'Automatic-Module-Name: blue.deniz.starsoul.earlyfixes\n' > manifest.txt
jar --create --file ../relauncher/mods/starsoul-early-fixes.jar --manifest manifest.txt --date 1980-02-01T00:00:02Z -C classes .
rm -rf classes manifest.txt
