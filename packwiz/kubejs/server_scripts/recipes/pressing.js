ServerEvents.recipes(event => {
    // [Output, Input, Name]
    const pressingrecipes = [
        ["createdeco:copper_coin", "minecraft:copper_nugget", "copper_coin"]
    ]

    pressingrecipes.forEach(([output, input, name]) => {
        event.recipes.create
            .pressing(output, input)
            .id(`kubejs:${name}_from_pressing`)
    })

})