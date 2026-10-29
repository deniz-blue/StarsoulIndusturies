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
  
})