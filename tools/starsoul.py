#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["websockets>=14", "prompt_toolkit>=3"]
# ///
"""Starsoul's server on Kinetic Panel from a terminal: console, power, logs and files."""
import argparse
import asyncio
import http.client
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from websockets.asyncio.client import connect
from websockets.exceptions import ConnectionClosed

PANEL = "https://kineticpanel.net"
CONFIG = Path.home() / ".config" / "kinetic-panel"
USER_AGENT = "starsoul-cli"
ANSI_ESCAPE = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]")
PROMPT_RESIDUE = re.compile(r"^(?:=?>\.*)+")
RECONNECT_DELAY_SECONDS = 3
STATE_AFTER_SIGNAL = {"start": "running", "restart": "running", "stop": "offline", "kill": "offline"}
POWER_PERMISSIONS = {"start": "control.start", "stop": "control.stop", "restart": "control.restart"}
POLL_SECONDS = 3
GIB = 1024 ** 3


class PanelError(Exception):
    pass


def read_setting(name: str) -> str:
    path = CONFIG / name
    if not path.exists():
        raise PanelError(f"missing {path} (see the README, 'Server from a terminal')")
    return path.read_text().strip()


class Panel:
    """Kinetic Panel's client API (Pterodactyl) for one server."""

    def __init__(self, server: str):
        self.server = server

    def request(self, path: str, body: dict | None = None) -> dict:
        request = urllib.request.Request(
            f"{PANEL}/api/client/servers/{self.server}{path}",
            data=None if body is None else json.dumps(body).encode(),
            headers={"Authorization": f"Bearer {read_setting('token')}", "Accept": "application/json",
                     "Content-Type": "application/json", "User-Agent": USER_AGENT},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                text = response.read()
        except urllib.error.HTTPError as error:
            raise PanelError(f"panel answered {error.code} for {path or '/'}: "
                             f"{error.read()[:200].decode(errors='replace')}") from None
        return json.loads(text) if text else {}

    def resources(self) -> dict:
        return self.request("/resources")["attributes"]

    def state(self) -> str:
        return self.resources()["current_state"]

    def read_file(self, file: str, attempts: int = 3) -> bytes:
        for attempt in range(attempts):
            signed_url = self.request(f"/files/download?file={urllib.parse.quote(file)}")["attributes"]["url"]
            request = urllib.request.Request(signed_url, headers={"User-Agent": USER_AGENT})
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    return response.read()
            except http.client.IncompleteRead:
                if attempt + 1 == attempts:
                    raise PanelError(f"{file} kept arriving cut short") from None

    def list_directory(self, directory: str) -> list[dict]:
        data = self.request(f"/files/list?directory={urllib.parse.quote(directory)}")["data"]
        return [entry["attributes"] for entry in data]


class ConsoleSocket:
    """The panel's console websocket (Pterodactyl Wings protocol)."""

    def __init__(self, panel: Panel):
        self.panel = panel
        self.socket = None

    async def fresh_credentials(self) -> tuple[str, str]:
        data = (await asyncio.to_thread(self.panel.request, "/websocket"))["data"]
        return data["socket"], data["token"]

    async def open(self) -> None:
        url, token = await self.fresh_credentials()
        # Wings refuses websocket connections whose Origin is not the panel.
        self.socket = await connect(url, origin=PANEL, max_size=None)
        await self.emit("auth", token)

    async def emit(self, event: str, *args) -> None:
        await self.socket.send(json.dumps({"event": event, "args": list(args)}))

    async def events(self):
        async for message in self.socket:
            payload = json.loads(message)
            event, args = payload["event"], payload.get("args") or []
            if event == "token expiring":
                _, token = await self.fresh_credentials()
                await self.emit("auth", token)
            elif event in ("jwt error", "token expired"):
                raise PanelError(f"{event}: {' '.join(map(str, args))}")
            yield event, args

    async def close(self) -> None:
        if self.socket:
            await self.socket.close()


def output_lines(args: list) -> list[str]:
    lines = (line.rsplit("\r", 1)[-1] for text in args for line in str(text).split("\n"))
    return [line for line in lines if PROMPT_RESIDUE.sub("", ANSI_ESCAPE.sub("", line)).strip()]


async def send_command(panel: Panel, command: str, listen_seconds: float) -> None:
    state = await asyncio.to_thread(panel.state)
    if state != "running":
        raise PanelError(f"server is {state}")
    console = ConsoleSocket(panel)
    await console.open()
    events = console.events()
    try:
        async for event, _ in events:
            if event == "auth success":
                break
        await console.emit("send command", command)
        try:
            async with asyncio.timeout(listen_seconds):
                async for event, args in events:
                    if event == "console output":
                        for line in output_lines(args):
                            print(ANSI_ESCAPE.sub("", line), flush=True)
        except TimeoutError:
            pass
    finally:
        await console.close()


async def attach(panel: Panel) -> None:
    from prompt_toolkit import PromptSession
    from prompt_toolkit.patch_stdout import patch_stdout

    console = ConsoleSocket(panel)
    first_connection = True

    async def show_events() -> None:
        nonlocal first_connection
        while True:
            try:
                await console.open()
                async for event, args in console.events():
                    if event == "auth success" and first_connection:
                        first_connection = False
                        await console.emit("send logs")
                    elif event == "console output":
                        for line in output_lines(args):
                            print(line)
                    elif event in ("daemon message", "install output"):
                        for line in output_lines(args):
                            print(f"\x1b[33m[panel] {line}\x1b[0m")
                    elif event == "daemon error":
                        print(f"\x1b[31m[panel error] {' '.join(map(str, args))}\x1b[0m")
                    elif event == "status":
                        print(f"\x1b[36m[server {args[0]}]\x1b[0m")
            except (ConnectionClosed, OSError, PanelError) as error:
                print(f"\x1b[31m[disconnected: {error}; reconnecting]\x1b[0m")
            await asyncio.sleep(RECONNECT_DELAY_SECONDS)

    session = PromptSession()
    with patch_stdout(raw=True):
        reader = asyncio.create_task(show_events())
        try:
            while True:
                try:
                    command = await session.prompt_async("> ")
                except (EOFError, KeyboardInterrupt):
                    break
                if not command.strip():
                    continue
                try:
                    await console.emit("send command", command)
                except (ConnectionClosed, AttributeError):
                    print("\x1b[31m[not connected, command dropped]\x1b[0m")
        finally:
            reader.cancel()
            await console.close()


def format_duration(seconds: float) -> str:
    seconds = int(seconds)
    hours, minutes = seconds // 3600, seconds % 3600 // 60
    if hours:
        return f"{hours}h {minutes}m"
    return f"{minutes}m {seconds % 60}s" if minutes else f"{seconds}s"


def format_usage(used_bytes: int, limit_mib: int) -> str:
    if not limit_mib:
        return f"{used_bytes / GIB:.1f} GiB"
    return f"{used_bytes / GIB:.1f} of {limit_mib / 1024:.1f} GiB"


def print_status(panel: Panel) -> None:
    details = panel.request("")
    resources = panel.resources()
    usage = resources["resources"]
    limits = details["attributes"]["limits"]
    state = resources["current_state"]
    print(f"{state}, up {format_duration(usage['uptime'] / 1000)}" if state == "running" else state)
    print(f"memory {format_usage(usage['memory_bytes'], limits['memory'])} · cpu {usage['cpu_absolute']:.0f}%"
          f" · disk {format_usage(usage['disk_bytes'], limits['disk'])}")
    meta = details.get("meta", {})
    permissions = meta.get("user_permissions", [])
    allowed = [signal for signal, permission in POWER_PERMISSIONS.items()
               if meta.get("is_server_owner") or "*" in permissions or permission in permissions]
    print("your key may " + (", ".join(allowed) if allowed else "not change the power state"))


def send_signal(panel: Panel, signal: str, wait: bool, timeout: int) -> None:
    target = STATE_AFTER_SIGNAL[signal]
    before = panel.state()
    if signal != "restart" and before == target:
        print(f"already {before}")
        return
    panel.request("/power", {"signal": signal})
    print(f"{signal} sent, was {before}", flush=True)
    if not wait:
        return
    started, last, changed = time.monotonic(), before, False
    while time.monotonic() - started < timeout:
        time.sleep(POLL_SECONDS)
        state = panel.state()
        changed = changed or state != before
        if state != last:
            print(f"{format_duration(time.monotonic() - started):>7}  {state}", flush=True)
            last = state
        if changed and state == target:
            return
    raise PanelError(f"still {last} after {format_duration(timeout)}")


def print_log_tail(panel: Panel, lines: int) -> None:
    text = panel.read_file("logs/latest.log").decode(errors="replace")
    print("\n".join(text.splitlines()[-lines:]))


def print_directory(panel: Panel, directory: str) -> None:
    for entry in sorted(panel.list_directory(directory), key=lambda e: e["name"]):
        print(entry["name"] + ("" if entry["is_file"] else "/"))


def download(panel: Panel, file: str, directory: Path) -> None:
    target = directory / Path(file).name
    target.write_bytes(panel.read_file(file))
    print(target)


def main() -> None:
    parser = argparse.ArgumentParser(prog="starsoul", description=__doc__)
    parser.add_argument("--server", help=f"server id (default: the one in {CONFIG / 'server'})")
    commands = parser.add_subparsers(dest="command", metavar="command")
    commands.add_parser("console", help="live console with a prompt (what plain `starsoul` does)")
    send = commands.add_parser("send", help="run one console command and print the output that follows")
    send.add_argument("words", nargs="+", metavar="command")
    send.add_argument("--listen", type=float, default=3.0, metavar="SECONDS",
                      help="how long to print output after sending (default 3)")
    commands.add_parser("status", help="state, uptime, memory, cpu and disk")
    for signal, text in [("start", "start the server"), ("stop", "stop the server, saving the world"),
                         ("restart", "restart the server"), ("kill", "stop at once, without saving")]:
        power = commands.add_parser(signal, help=f"{text}, and wait until the panel says it is done")
        power.add_argument("--no-wait", action="store_true", help="return once the panel has the signal")
        power.add_argument("--timeout", type=int, default=900, help="seconds to wait (default 900)")
    logs = commands.add_parser("logs", help="end of logs/latest.log (times are UTC)")
    logs.add_argument("lines", nargs="?", type=int, default=100)
    ls = commands.add_parser("ls", help="list the server's files")
    ls.add_argument("directory", nargs="?", default="/")
    get = commands.add_parser("get", help="download one of the server's files")
    get.add_argument("file")
    get.add_argument("--to", type=Path, default=Path.cwd(), help="folder to save it in (default: here)")
    arguments = parser.parse_args()

    try:
        panel = Panel(arguments.server or read_setting("server"))
        match arguments.command:
            case None | "console":
                asyncio.run(attach(panel))
            case "send":
                asyncio.run(send_command(panel, " ".join(arguments.words), arguments.listen))
            case "status":
                print_status(panel)
            case "start" | "stop" | "restart" | "kill":
                send_signal(panel, arguments.command, not arguments.no_wait, arguments.timeout)
            case "logs":
                print_log_tail(panel, arguments.lines)
            case "ls":
                print_directory(panel, arguments.directory)
            case "get":
                download(panel, arguments.file, arguments.to)
    except (PanelError, OSError) as error:
        sys.exit(f"starsoul: {error}")
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
