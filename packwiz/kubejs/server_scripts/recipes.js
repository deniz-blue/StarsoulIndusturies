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

  //Mycelium recipe
  event.custom({
   "type": "dndesires:seething",
   "ingredients": [
     {
       "item": "minecraft:grass_block"
     }
   ],
   "results": [
     {
       "id": "minecraft:mycelium"
      }
    ]
  })
  
  event.shapeless("kubejs:charcoal_block", ["9x minecraft:charcoal"])
  event.shapeless(Item.of("minecraft:charcoal", 9), ["kubejs:charcoal_block"])
  event.remove({id:"createcasing:crafting/fluid_pipe/brass_vertical"})
  event.remove({id:"create_connected:crafting/kinetics/item_silo"})

  //monorails crash the server
  event.remove({
    type: "create:sequenced_assembly",
    output: "railways:track_monorail"
  })
  event.recipes.create
    .crushing(
      [
        CreateItem.of("create:flywheel", 1),
        CreateItem.of("simulated:gimbal_sensor", 1),
      ],
      "aeroworks:gyroscope",
    )
    .id("kubejs:gyroscope_recycling");

  //Fake egg
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

  //Invisible Item Frame
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

  //Invisible Glow Item Frame
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

  //Grass Block
  event.shaped(
    Item.of('minecraft:grass_block', 1),
    [
        'A',
        'B'
    ],
    {
      A: 'minecraft:wheat_seeds',
      B: 'minecraft:dirt'
    }
  );

  //casing stuff

  //Chromatic Compound Recipe
  event.recipes.create
      .mixing("create:chromatic_compound", [
      "create:polished_rose_quartz",
      "create:polished_rose_quartz",
      "minecraft:redstone",
      "create:powdered_obsidian",
      "aeronautics:end_stone_powder",
      ]).heated()
      .id("kubejs:chromatic_compound_from_mixing");

  //Shadow Steel Recipe A
  event.recipes.create
      .haunting("create:shadow_steel", "create:chromatic_compound")
      .id("kubejs:chromatic_compound_to_shadow_steel");

  //Shadow Steel Recipe B  
  event.recipes.create
      .haunting("create:shadow_steel", "create:refined_radiance")
      .id("kubejs:refined_radiance_to_shadow_steel");

  //Refined Radiance Recipe A
  event.recipes.minecraft
      .blasting("create:refined_radiance", "create:chromatic_compound")
      .id("kubejs:chromatic_compound_to_refined_radiance");

  //Refined Radiance Recipe B  
  event.recipes.minecraft
      .blasting("create:refined_radiance", "create:shadow_steel")
      .id("kubejs:shadow_steel_to_refined_radiance");

  //Shadow Casing Recipe A
  event.custom({
  "type": "create:item_application",
  "ingredients": [
      {
      "tag": "c:stripped_woods"
      },
      {
      "item": "create:shadow_steel"
      }
  ],
  "results": [
      {
      "id": "create:shadow_steel_casing"
      }
  ]
  })

  //Shadow Casing Recipe B
  event.custom({
  "type": "create:item_application",
  "ingredients": [
      {
      "tag": "c:stripped_logs"
      },
      {
      "item": "create:shadow_steel"
      }
  ],
  "results": [
      {
      "id": "create:shadow_steel_casing"
      }
  ]
  })

  //Shadow Casing Recipe C  
  event.recipes.create
      .haunting("create:shadow_steel_casing", "create:refined_radiance_casing")
      .id("kubejs:refined_radiance_casing_to_shadow_steel_casing");

  //Refined Radiance Casing Recipe A
  event.custom({
  "type": "create:item_application",
  "ingredients": [
      {
      "tag": "c:stripped_woods"
      },
      {
      "item": "create:refined_radiance"
      }
  ],
  "results": [
      {
      "id": "create:refined_radiance_casing"
      }
  ]
  })

  //Refined Radiance Casing Recipe B
  event.custom({
  "type": "create:item_application",
  "ingredients": [
      {
      "tag": "c:stripped_logs"
      },
      {
      "item": "create:refined_radiance"
      }
  ],
  "results": [
      {
      "id": "create:refined_radiance_casing"
      }
  ]
  })

  //Refined Radiance Casing Recipe C
  event.recipes.minecraft
      .blasting("create:refined_radiance_casing", "create:shadow_steel_casing")
      .id("kubejs:shadow_steel_casing_to_refined_radiance_casing");

})
