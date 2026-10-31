ServerEvents.recipes((event) => {
    // [Output, Input, Name]
    const pressingrecipes = [
        ["createdeco:copper_coin", "minecraft:copper_nugget", "copper_coin"],
    ];

    pressingrecipes.forEach(([output, input, name]) => {
        event.recipes.create
            .pressing(output, input)
            .id(`kubejs:${name}_from_pressing`);
    });
});

/* tree bark pressing recipe */
ServerEvents.recipes((event) => {
    Ingredient.of("#minecraft:logs").itemIds.forEach((fullLogID) => {
        if (!Item.exists(fullLogID)) return;
        if (fullLogID.includes("stripped")) return;

        const parts = fullLogID.split(":");
        const namespace = parts[0];
        const logPath = parts[1];

        const strippedId = `${namespace}:stripped_${logPath}`;

        event.recipes.create
            .pressing(["farmersdelight:tree_bark", strippedId], fullLogID)
            .id(`kubejs:${logPath}_from_pressing`);
    });
});
