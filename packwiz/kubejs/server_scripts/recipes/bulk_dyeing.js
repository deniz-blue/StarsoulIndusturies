ServerEvents.recipes((event) => {
    // [Color, Output, Amount, Input, Name]
    const coloringRecipes = [
        ["minecraft:black", "minecraft:ink_sac", 1, "create:pulp", "ink_sac"],
    ];

    coloringRecipes.forEach(([color, output, amount, input, name]) => {
        event.custom({
            type: "create_dragons_plus:coloring",
            color: color,
            ingredients: [
                {
                    item: input
                }
            ],
            results: [
                {
                    id: output,
                    count: amount
                }
            ]
        }).id(`kubejs:${name}_from_bulk_coloring`);
    })
})