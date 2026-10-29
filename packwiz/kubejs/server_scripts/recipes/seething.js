ServerEvents.recipes((event) => {
    const seethingRecipes = [
        // [Output, Input, Name]
        ["minecraft:mycelium", "minecraft:grass_block", "mycelium"]
    ];

    seethingRecipes.forEach(([output, input, name]) => {
        event.custom({
            "type": "dndesires:seething",
            "ingredients": [
                {
                    "item": input
                }
            ],
            "results": [
                {
                    "id": output
                }
            ]
        }).id(`kubejs:${name}_from_seething`);
    });
})