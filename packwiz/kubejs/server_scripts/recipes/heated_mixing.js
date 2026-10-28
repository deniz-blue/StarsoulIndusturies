ServerEvents.recipes((event) => {
    const heatedMixingRecipes = [
        // [Output, [Ingredient(s)], Name]
        ["create:chromatic_compound", [
            "create:polished_rose_quartz",
            "create:polished_rose_quartz",
            "minecraft:redstone",
            "create:powdered_obsidian",
            "aeronautics:end_stone_powder"
        ], "chromatic_compound"]
    ];

    heatedMixingRecipes.forEach(([output, ingredients, name]) => {
        event.recipes.create
            .mixing(output, ingredients)
            .heated()
            .id(`kubejs:${name}_from_mixing`);
    });
});