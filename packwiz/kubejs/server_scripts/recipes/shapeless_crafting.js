ServerEvents.recipes((event) => {
    // [Output, Amount, [Input], Name]
    const shapelessrecipe = [
        [
            "kubejs:charcoal_block",
            1,
            ["9x minecraft:charcoal"],
            "charcoal_block",
        ],
        ["minecraft:charcoal", 9, ["kubejs:charcoal_block"], "charcoal"],
        ["minecraft:sculk", 1, ["4x minecraft:sculk_vein"], "sculk"],
        ["minecraft:sculk_vein", 4, ["minecraft:sculk"], "sculk_vein"],
        ["minecraft:quartz", 4, ["minecraft:quartz_block"], "quartz"],
        [
            "minecraft:wool",
            2,
            [Item.of("rusticdelight:cotton_boll", 8)],
            "cotton_to_wool",
        ],
    ];

    shapelessrecipe.forEach(([output, amount, input, name]) => {
        event
            .shapeless(Item.of(output, amount), input)
            .id(`kubejs:${name}_from_shapeless_crafting`);
    });
});
