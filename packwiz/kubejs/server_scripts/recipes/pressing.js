ServerEvents.recipes((event) => {
    // [Output, Input, Name]
    const pressingrecipes = [
        ["createdeco:copper_coin", "minecraft:copper_nugget", "copper_coin"],
        [
            Item.of("farmersdelight:tree_bark", 4),
            Ingredient.of("#c:stripped_logs"),
            "tree_bark",
        ],
    ];

    pressingrecipes.forEach(([output, input, name]) => {
        event.recipes.create
            .pressing(output, input)
            .id(`kubejs:${name}_from_pressing`);
    });
});
