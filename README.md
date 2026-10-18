# StarsoulIndusturies

Modpack for Starsoul

Modpack and all files are under `packwiz` directory!

You need to install `packwiz` CLI tool to edit this modpack. You can download it here:
- https://nightly.link/packwiz/packwiz/workflows/go/main?preview

## Commands you will most likely use

```bash
# add a mod from modrinth
packwiz modrinth add ...

# refresh index (need to do if you change files under packwiz/ !!!)
packwiz refresh

# send changes to everyone
git pull && git add . && git commit -m "commit message" && git push
```

## Developing locally

```sh
python3 tools/dev.py check   # seconds: index, unsup version, every mod's dependencies (flavors on and off)
python3 tools/dev.py serve   # builds, serves on localhost:8000, rebuilds on change
python3 tools/dev.py boot    # headless server boot (client too with BOOT_CLIENT set), then KubeJS errors
```

`serve` also makes a Prism instance called `Starsoul-dev` that updates from localhost, so a
change can be tried in real Prism before anyone gets it: `prismlauncher --launch Starsoul-dev`.

`git push` runs `dev.py check --pushing` first and stops if it fails (the hook is in
`tools/hooks`, turned on with `git config core.hooksPath tools/hooks`).

## Server from a terminal

`tools/starsoul.py` talks to the server through Kinetic Panel: console, power, logs and
files. It needs [uv](https://docs.astral.sh/uv/), which fetches its two libraries on the
first run.

Once:

1. Make an API key in Kinetic Panel (Account → API Credentials).
2. Put it in `~/.config/kinetic-panel/token`, and the server's id (the part after
   `/server/` in the panel's address) in `~/.config/kinetic-panel/server`. On Windows
   `~` is your user folder.
3. To type `starsoul` anywhere: `ln -s "$PWD/tools/starsoul.py" ~/.local/bin/starsoul`.
   Without it, `uv run tools/starsoul.py status` and so on.

```sh
starsoul                 # live console with a prompt
starsoul send list       # one command, prints what follows
starsoul status          # state, uptime, memory, cpu, disk
starsoul restart         # also start, stop, kill; waits until the panel says it's done
starsoul logs 200        # end of latest.log (times are UTC)
starsoul ls config       # the server's files; `get <file>` downloads one
```

