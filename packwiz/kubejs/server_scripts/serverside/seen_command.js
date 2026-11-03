function onSeenExecute(ctx) {
    server.persistentData;
}

ServerEvents.commandRegistry((event) => {
    const { commands: Commands } = event;

    event.register(
        Commands.literal("seen").then(
            Commands.argument(
                "reason",
                StringArgumentType.greedyString(),
            ).executes(onRestartSequence),
        ),
    );
});
