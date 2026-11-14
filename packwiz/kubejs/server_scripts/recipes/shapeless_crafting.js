ServerEvents.recipes((event) => {
    // [Output, Amount, [_x Input], Name]
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
        ["minecraft:white_wool", 2, ["8x rusticdelight:cotton_boll"], "cotton_to_wool"],
        ["interiors:kelp_chair", 1, ["#minecraft:planks", "#minecraft:wooden_slabs", "minecraft:dried_kelp"], "kelp_chair_normal"],
        ["interiors:kelp_chair", 1, ["#minecraft:planks", "interiors:kelp_seat"], "kelp_chair_from_seat"],
        ["interiors:kelp_chair", 1, ["#minecraft:wooden_slabs", "interiors:kelp_floor_chair"], "kelp_chair_from_floor_chair"],
        ["interiors:kelp_floor_chair", 1, ["#minecraft:wooden_slabs", "interiors:kelp_seat"], "kelp_floor_chair_from_seat"],
        ["interiors:kelp_floor_chair", 1, ["2x #minecraft:wooden_slabs", "minecraft:dried_kelp"], "kelp_floor_chair_normal"],
        ["interiors:kelp_seat", 1, ["#minecraft:wooden_slabs", "minecraft:dried_kelp"], "kelp_seat_normal"],
        ["interiors:kelp_seat", 1, ["#create:seats", "minecraft:dried_kelp"], "kelp_seat_from_seat"],
        ["minecraft:ink_sac", 2, ["8x create:pulp", "minecraft:black_dye"], "ink_sac"],
    ];


    shapelessrecipe.forEach(([output, amount, input, name]) => {
        event
            .shapeless(Item.of(output, amount), input)
            .id(`kubejs:${name}_from_shapeless_crafting`);
    });

    let fullDye = ""
    let newEnvelope = ""

    const colors = [
        "white",
        "light_gray",
        "gray",
        "black",
        "brown",
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "cyan",
        "light_blue",
        "blue",
        "purple",
        "magenta",
        "pink",
    ]

    // envelope crafting
    colors.forEach((color) => {
        fullDye = `minecraft:${color}_dye`;
        newEnvelope = `aeronautics:${color}_envelope`;
        event.shapeless(newEnvelope, [fullDye, "#aeronautics:envelope"])
        .id(`kubejs:${color}_envelope_from_shapeless_crafting`);
    });
});
