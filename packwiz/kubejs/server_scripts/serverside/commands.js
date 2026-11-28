ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  
  event.register(Commands.literal('spawn')
    .executes(ctx => spawn(ctx.source.player))
  )
  event.register(Commands.literal('whiteworld')
    .requires(source => source.hasPermission(4))
    .executes(ctx => whiteworld(ctx.source.player))
  )
    event.register(Commands.literal('tpevent')
    .requires(source => source.hasPermission(3))
    .executes(ctx => tpevent(ctx.source.player))
  )
  event.register(Commands.literal('itemcount')
    .executes(ctx => {
        const user = ctx.source.player;
        if (!user) {
            ctx.source.player.tell(Text.red('You must be a player to use this command.'));
            return 0;
        }
        const objective = ctx.source.server.scoreboard.getObjective('item_count');
        if (!objective) {
            ctx.source.player.tell(Text.red('Item count objective not found.'));
            return 0;
        }
        const itemcount = ctx.source.server.scoreboard.getOrCreatePlayerScore(user, objective);
        ctx.source.player.tell(Text.green('You have ' + itemcount.get() + ' items. (Item counts update by minute)'));
        return 1;
    }))  
  
  // Helper functions
  const spawn = (player) => {
    player.teleportTo("minecraft:overworld",19.5, 220, -48.5, -90, 0);
    return 1
  }
  const whiteworld = (player) => {
    player.teleportTo("haku_world:build",285.5, -48, -131.5, -90, 0);
    return 1
  }  
  const tpevent = (player) => {
    player.teleportTo("starsoulsmp:events",0, 75, 0, 0, 0);
    return 1
  }
  
})