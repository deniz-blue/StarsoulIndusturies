#!/usr/bin/env bash
# Boots a NeoForge server once until "Done (", stops it, and reports.
#   boot-server.sh <server dir> [neoforge version]
# The server dir holds mods/ already. With a version and no run.sh yet, NeoForge is
# installed into it first. Accepts the EULA in that throwaway dir.
set -u
dir=$(realpath "$1")
version=${2:-}
java=/usr/lib/jvm/java-21-openjdk/bin/java
cd "$dir" || exit 2
if [ ! -f run.sh ]; then
  [ -n "$version" ] || { echo "no run.sh here and no NeoForge version to install"; exit 2; }
  installer="$dir/../neoforge-$version-installer.jar"
  [ -f "$installer" ] || curl -sfL -o "$installer" \
    "https://maven.neoforged.net/releases/net/neoforged/neoforge/$version/neoforge-$version-installer.jar" || exit 2
  "$java" -jar "$installer" --installServer "$dir" > install.log 2>&1 || { tail -3 install.log; exit 2; }
fi
echo eula=true > eula.txt
rm -f console.in
mkfifo console.in
exec 3<>console.in
PATH=$(dirname "$java"):$PATH ./run.sh nogui < console.in > server.log 2>&1 &
server=$!
for _ in $(seq 1 450); do
  if grep -q 'Done (' server.log; then sleep 5; echo stop >&3; break; fi
  kill -0 $server 2>/dev/null || break
  sleep 2
done
kill -0 $server 2>/dev/null && ! grep -q 'Done (' server.log && kill $server
wait $server
code=$?
exec 3>&-
rm -f console.in
echo "server exit $code; $(grep -o 'Done ([^)]*)' server.log | head -1)"
echo "config files: $(find config -type f 2>/dev/null | wc -l)"
grep -m3 -E 'FATAL|requires .* or above|Failed to start' server.log | cut -c1-200
