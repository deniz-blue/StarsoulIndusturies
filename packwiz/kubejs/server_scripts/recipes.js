ServerEvents.recipes((event) => {
  //uses an array so I don't have to write 5 recipes
  const hydraulicRecipes = [
    ["minecraft:iron_nugget", "create:crimsite", "crimsite"],
    ["create:copper_nugget", "create:veridium", "veridium"],
    ["minecraft:gold_nugget", "create:ochrum", "ochrum"],
    ["create:zinc_nugget", "create:asurine", "asurine"],
    ["minecraft:quartz", "create:limestone", "limestone"],
  ];

  // Removes the original recipes
  hydraulicRecipes.forEach(([input, output, name]) => {
    event.remove({
      type: "dndesires:hydraulic_compacting",
      output: output,
    });
  });

  //create recipes for each stone type.
  hydraulicRecipes.forEach(([input, output, name]) => {
    event
      .custom({
        type: "dndesires:hydraulic_compacting",

        heat_requirement: "superheated",

        ingredients: [
          //4 nuggets
          { item: input },
          { item: input },
          { item: input },
          { item: input },

          { item: "minecraft:basalt" },
          { item: "minecraft:basalt" },

          {
            type: "neoforge:tag",
            amount: 500,
            tag: "c:lava",
          },
        ],

        results: [
          {
            count: 2,
            id: output,
          },
        ],
      })
      .id(`kubejs:${name}_from_hydraulic_compacting`);
  });

  //Redstone Recipe
  event.recipes.create
    .mixing("minecraft:redstone", [
      "create:cinder_flour",
      "minecraft:gunpowder",
      Fluid.of("minecraft:lava", 150),
    ])
    .id("kubejs:redstone_from_mixing");

  //Scoria
  event.recipes.minecraft
    .blasting("create:scoria", "minecraft:soul_sand")
    .id("kubejs:scoria_from_blasting");

  //Scorchia
  event.recipes.minecraft
    .smoking("create:scorchia", "create:scoria")
    .id("kubejs:scorchia_from_smoking");

  //Netherrack
  event.recipes.create
    .haunting("minecraft:netherrack", "minecraft:basalt")
    .id("kubejs:netherrack_from_haunting");

  //Tuff Recipe
  event.recipes.create
    .mixing("minecraft:tuff", [
      "minecraft:stone",
      "minecraft:cobblestone",
      "minecraft:quartz",
    ])
    .id("kubejs:tuff_from_mixing");

  //Modified tuff loot table
  event.recipes.create
    .crushing(
      [
        CreateItem.of("minecraft:flint", 0.25),
        CreateItem.of("minecraft:gold_nugget", 0.25),
        CreateItem.of("create:copper_nugget", 0.25),
        CreateItem.of("create:zinc_nugget", 0.25),
        CreateItem.of("minecraft:iron_nugget", 0.25),
      ],
      "minecraft:tuff",
    )
    .id("kubejs:tuff_crushing");
  const t = "kubejs:incomplete_cog";
  event.recipes.create.sequenced_assembly(
      [
        CreateItem.of("numismatics:cog", 0.01),
        CreateItem.of("create:crushed_raw_gold",0.09),
        CreateItem.of("createdeco:netherite_nugget",0.03),
        CreateItem.of("minecraft:gold_ingot",0.09),
        CreateItem.of("minecraft:gold_nugget",0.09),
        CreateItem.of("create:golden_sheet",0.09),
        CreateItem.of("createdeco:gold_coin",0.09),
        CreateItem.of("kubejs:malformed_cog",0.05),
        CreateItem.of("createdeco:industrial_iron_nugget",0.09),
        CreateItem.of("createdeco:netherite_coin",0.09)
    ],
    "kubejs:unprocessed_cog",
    [
        event.recipes.create.filling(t,[t,Fluid.of('minecraft:lava',250)]),
        event.recipes.create.pressing(t,t),
        event.recipes.create.pressing(t,t),
        event.recipes.create.cutting(t,t),
    ]
  ).transitionalItem('kubejs:incomplete_cog').loops(20).id('cog_from_netherite_nugget');
  
  event.recipes.create.deploying('kubejs:unprocessed_cog',['create:golden_sheet','createdeco:netherite_nugget'])
  
  event.recipes.create.crushing(
      [
          CreateItem.of('create:crushed_raw_gold',1),
          CreateItem.of('createdeco:netherite_nugget',0.05)
      ],
      'kubejs:malformed_cog'
  );
  event.shapeless("kubejs:charcoal_block", ["9x minecraft:charcoal"])
  event.shapeless(Item.of("minecraft:charcoal", 9), ["kubejs:charcoal_block"])
  event.remove({id:"createcasing:crafting/fluid_pipe/brass_vertical"})
  event.remove({id:"create_connected:crafting/kinetics/item_silo"})
  //event.remove({id:"aeroworks:gyroscope"})
  //monorails crash the server
  event.remove({
    type: "create:sequenced_assembly",
    output: "railways:track_monorail"
  })
  /*event.recipes.create
    .crushing(
      [
        CreateItem.of("create:flywheel", 1),
        CreateItem.of("simulated:gimbal_sensor", 1),
      ],
      "aeroworks:gyroscope",
    )
    .id("kubejs:gyroscope_recycling");*/
  
  event.shaped(
    Item.of(`minecraft:dragon_egg[custom_name='{"italic":false,"text":"Fake Dragon Egg"}',rarity="rare"]`, 4),
    [
        'ABA',
        'BCB',
        'ABA'
    ],
      {
          A: "minecraft:crying_obsidian",
          B: "minecraft:nether_star",
          C: "minecraft:dragon_egg"
      }
  )

  event.shaped(
    Item.of('minecraft:item_frame[minecraft:entity_data={id:"minecraft:item_frame",Invisible:1b},minecraft:custom_name=\'{"text":"Invisible Item Frame","italic":false}\']', 1),
    [
        'BBB',
        'BAB',
        'BBB'
    ],
    {
        A: 'minecraft:item_frame',
        B: 'minecraft:glass_pane'
    }
  );

  event.shaped(
    Item.of('minecraft:glow_item_frame[minecraft:entity_data={id:"minecraft:glow_item_frame",Invisible:1b},minecraft:custom_name=\'{"text":"Invisible Glow Item Frame","italic":false}\']'),
    [
        'BBB',
        'BAB',
        'BBB'
    ],
    {
        A: 'minecraft:glow_item_frame',
        B: 'minecraft:glass_pane'
    }
  );

  });
  
