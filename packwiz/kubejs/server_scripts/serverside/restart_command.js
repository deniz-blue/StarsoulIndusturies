/** biome-ignore-all lint/style/useConst: kubejs uses ancient javascript */

const RESTART_PROG_BAR_ID = "kubejs:restart_progress_bar";
const serverStartingIn = `{"text":"S","color":"#ffff66"},{"text":"e","color":"#fffb67"},{"text":"r","color":"#fff868"},{"text":"v","color":"#fff468"},{"text":"e","color":"#fff069"},{"text":"r","color":"#ffed6a"},{"text":" ","color":"#ffe96b"},{"text":"R","color":"#ffe66c"},{"text":"e","color":"#ffe26c"},{"text":"s","color":"#ffde6d"},{"text":"t","color":"#ffdb6e"},{"text":"a","color":"#ffd76f"},{"text":"r","color":"#ffd36f"},{"text":"t","color":"#ffd070"},{"text":"i","color":"#ffcc71"},{"text":"n","color":"#ffc972"},{"text":"g","color":"#ffc573"},{"text":" ","color":"#ffc173"},{"text":"i","color":"#ffbe74"},{"text":"n","color":"#ffba75"}`;

const setupProgBar = (server, counter) => {
    server.runCommandSilent(
        `bossbar add ${RESTART_PROG_BAR_ID} [${serverStartingIn}]`,
    );
    server.runCommandSilent(`bossbar set ${RESTART_PROG_BAR_ID} color yellow`);
    server.runCommandSilent(
        `bossbar set ${RESTART_PROG_BAR_ID} style notched_10`,
    );
    server.runCommandSilent(
        `bossbar set ${RESTART_PROG_BAR_ID} max ${counter}`,
    );
    server.runCommandSilent(
        `bossbar set ${RESTART_PROG_BAR_ID} value ${counter}`,
    );
    server.runCommandSilent(`bossbar set ${RESTART_PROG_BAR_ID} players @a`);
};

const runCommandToPlayers = (server, command) => {
    server.runCommandSilent(`execute as @a at @s run ${command}`);
};

let MINUTE = 60;

const runMessageTitle = (server, title, color) => {
    let jsonMSG = `{"text":"${title}","color":"${color}"}`;
    server.runCommandSilent(`tellraw @a ${jsonMSG}`);
    server.runCommandSilent(`title @a subtitle ${jsonMSG}`);
    server.runCommandSilent('title @a title {"text":" "}');
};

let countdownIntervalID = 0;

const onRestartSequence = (ctx) => {
    let server = ctx.source.server;
    let counter = 60 * 5;
    let dateBeforeRestart = Date.now();

    runMessageTitle(server, "Server restart in 5 minutes!", "yellow");

    runCommandToPlayers(
        server,
        "playsound minecraft:block.anvil.land master @s ~ ~ ~ 0.5 0.5",
    );

    setupProgBar(server, counter);

    countdownIntervalID = setInterval(() => {
        counter--;
        server.runCommandSilent(
            `bossbar set ${RESTART_PROG_BAR_ID} value ${counter}`,
        );

        const formattedTime = `${Math.floor(counter / MINUTE)}:${String(counter % MINUTE).padStart(2, "0")}`;
        const shouldBlink = counter <= MINUTE && counter % 2;
        const nameColor = `#${shouldBlink ? "FF8870" : "FFFFFF"}`;
        const name = `[${serverStartingIn},{"text":" ${formattedTime}","color":"${nameColor}"}]`;

        server.runCommandSilent(
            `bossbar set ${RESTART_PROG_BAR_ID} color ${shouldBlink ? "red" : "yellow"}`,
        );

        server.runCommandSilent(
            `bossbar set ${RESTART_PROG_BAR_ID} name ${name}`,
        );

        runCommandToPlayers(
            server,
            `playsound minecraft:block.metal_pressure_plate.click_on master @s ~ ~ ~ 0.7 ${counter % 2 ? 2 : 1.8}`,
        );

        // make new joined players see counter after the beginning restart sequence
        if (counter % 5)
            server.runCommandSilent(
                `bossbar set ${RESTART_PROG_BAR_ID} players @a`,
            );

        if (counter === 2 * MINUTE) {
            runMessageTitle(server, "Server restart in 2 minutes!", "yellow");
            runCommandToPlayers(
                server,
                "playsound minecraft:block.anvil.land master @s ~ ~ ~ 0.5 0.5",
            );
        }

        if (counter === MINUTE) {
            runMessageTitle(server, "Server restart in 1 minute!", "red");
            runCommandToPlayers(
                server,
                "playsound minecraft:block.anvil.land master @s ~ ~ ~ 0.5 0.5",
            );
            server.runCommandSilent(
                `datapack enable "file/alert_noteblocks_for_restart.zip"`,
            );
        }

        if (counter === 50) {
            runMessageTitle(
                server,
                "Make sure your ship stands still!",
                "yellow",
            );

            runCommandToPlayers(
                server,
                "playsound minecraft:block.note_block.pling master @s ~ ~ ~ 0.5 0.5",
            );
        }

        if (counter === 20) {
            runMessageTitle(server, "Server restart in 20 seconds!", "red");
            runCommandToPlayers(
                server,
                "playsound minecraft:block.anvil.land master @s ~ ~ ~ 0.5 0.5",
            );
            runCommandToPlayers(
                server,
                "playsound minecraft:block.anvil.land master @s ~ ~ ~ 0.5 0.5",
            );
            runCommandToPlayers(
                server,
                "function alert_noteblocks_for_restart:play",
            );
        }

        if (counter === 3) {
            runMessageTitle(server, "cya later", "yellow");
            server.runCommandSilent(
                server,
                "playsound minecraft:block.beacon.deactivate master @s ~ ~ ~ 1 1.3",
            );
            server.runCommandSilent(
                server,
                "playsound minecraft:block.beacon.activate master @s ~ ~ ~ 1 1.3",
            );

            server.runCommandSilent("/sable paused true");
        }

        if (counter === 0) {
            server.runCommandSilent(
                "kick @a Server is restarting. Come back for a while!",
            );
            return;
        }

        if (counter === -1) {
            server.runCommandSilent(
                "bossbar remove kubejs:restart_progress_bar",
            );
            server.runCommandSilent(
                "/function alert_noteblocks_for_restart:uninstall",
            );
        }

        let shouldStopServer =
            Date.now() - dateBeforeRestart > (5 * MINUTE + 15) * 1_000;

        if (shouldStopServer) {
            clearInterval(countdownIntervalID);
            server.tell("Stopping actually!");
            server.runCommandSilent("/stop");
        }
    }, 1000);

    return 1;
};

const cancel_restart = (ctx) => {
    let player = ctx.source.player;
    let server = ctx.source.server;

    if (!countdownIntervalID) {
        player.tell(Text.red("Server wasn't even restarting:!?::!?::!?:"));
        return 1;
    }

    runMessageTitle(server, "Server restart cancelled! Phew...", "#00F43E");
    runCommandToPlayers(
        server,
        "playsound minecraft:block.note_block.pling master @s ~ ~ ~ 0.5 0.5",
    );

    clearInterval(countdownIntervalID);
    server.runCommandSilent("bossbar remove kubejs:restart_progress_bar");
    countdownIntervalID = 0;

    return 1;
};

ServerEvents.commandRegistry((event) => {
    const { commands: Commands } = event;

    event.register(
        Commands.literal("ONLY_KINETIC_PANEL_IS_SAFE_TO_RUN_THIS")
            .requires((source) => source.hasPermission(4))
            .executes(onRestartSequence),
    );

    event.register(
        Commands.literal("cancel_restart")
            .requires((source) => source.hasPermission(4))
            .executes(cancel_restart),
    );
});
