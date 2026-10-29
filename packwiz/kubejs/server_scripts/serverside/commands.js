const StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
const IntegerArgumentType = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType');

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
    .requires(source => source.hasPermission(4))
    .executes(ctx => tpevent(ctx.source.player))
  )
    
 //warn system 
event.register(Commands.literal('warn')
    .requires(source => source.hasPermission(3))
    .then(Commands.argument('player', Arguments.PLAYER.create(event))
        //remove specific value (just removes a set amount rn not a specific value)
        .then(Commands.literal('remove')
            .then(Commands.argument('amount', IntegerArgumentType.integer(0))
                .executes(ctx => {
                   const amount = IntegerArgumentType.getInteger(ctx, 'amount');
                   const warned = Arguments.PLAYER.getResult(ctx, 'player');
                   const objective = ctx.source.server.scoreboard.getObjective('warns');
                   const warnnumber = ctx.source.server.scoreboard.getOrCreatePlayerScore(warned, objective);
                   warnnumber.set(amount);
                   ctx.source.player.tell(Text.green(warned.username + ' now has ' + warnnumber.get() + ' warnings.'))        
               })
            )
    )
         //get their warns (amount not reason currently)
        .then(Commands.literal('get')
            .executes(ctx => {
                const warned = Arguments.PLAYER.getResult(ctx, 'player');
                const objective = ctx.source.server.scoreboard.getObjective('warns');
                const warnnumber = ctx.source.server.scoreboard.getOrCreatePlayerScore(warned, objective);
                ctx.source.player.tell(Text.green(warned.username + ' has ' + warnnumber.get() + ' warnings.'));
                return 1;
            })
        )
         //get rid of all the warns
        .then(Commands.literal('clear')
            .executes(ctx => {
                const warned = Arguments.PLAYER.getResult(ctx, 'player');
                const objective = ctx.source.server.scoreboard.getObjective('warns');
                const warnnumber = ctx.source.server.scoreboard.getOrCreatePlayerScore(warned, objective);
                warnnumber.set(0);
                ctx.source.player.tell(Text.green('Cleared all warnings for ' + warned.username + '.'));
                return 1;
            })
        )
         //give them a warn
        .then(Commands.argument('reason', StringArgumentType.greedyString())
            .executes(ctx => {
                const warned = Arguments.PLAYER.getResult(ctx, 'player');
                const reason = StringArgumentType.getString(ctx, 'reason');
                const objective = ctx.source.server.scoreboard.getObjective('warns');
                const warnnumber = ctx.source.server.scoreboard.getOrCreatePlayerScore(warned, objective);
                const newwarnnumber = warnnumber.get() + 1;
                warnnumber.set(newwarnnumber);
                warned.tell(Text.red('You have been warned for ' + reason + '. This is warning #' + newwarnnumber));
                ctx.source.player.tell(Text.green('Successfully warned ' + warned.username + ' for ' + reason + '. This is warning #' + newwarnnumber));
                return 1;
            })
        )
    )
);

  
  
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
  }
  
})