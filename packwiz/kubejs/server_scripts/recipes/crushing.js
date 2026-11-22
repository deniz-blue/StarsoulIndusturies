ServerEvents.recipes((event) => { 
    const crushingRecipes = [
        // [[Output(s), chance], Input, Name]
        [[["minecraft:flint", 0.25], ["minecraft:gold_nugget", 0.25],["create:copper_nugget", 0.25], ["create:zinc_nugget", 0.25], ["minecraft:iron_nugget", 0.25]], "minecraft:tuff", "tuff"],
        [[["create:crushed_raw_gold",0.25],["minecraft:gold_nugget",0.25]],"create:ochrum","ochrum"]
    ];

    event.remove({ input: 'create:ochrum', 'type': 'create:crushing' })

    crushingRecipes.forEach(([outputs, input, name]) => {
        event.recipes.create
            .crushing(
                outputs.map(([item, chance]) => CreateItem.of(item, chance)),
                input,
            )
            .id(`kubejs:${name}_crushing`)
    })
})
