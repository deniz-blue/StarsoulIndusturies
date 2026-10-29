ServerEvents.recipes((event) => {
    // [Output, Amount, [Input], Name]
    const shapelessrecipe = [
        ["kubejs:charcoal_block", 1, ["9x minecraft:charcoal"], "charcoal_block"],
        ["minecraft:charcoal", 9, ["kubejs:charcoal_block"], "charcoal"],
        ["minecraft:sculk", 1, ["4x minecraft:sculk_vein"], "sculk"],
        ["minecraft:sculk_vein", 4, ["minecraft:sculk"], "sculk_vein"],
        ["minecraft:quartz", 4, ["minecraft:quartz_block"], "quartz"]
    ]

    shapelessrecipe.forEach(([output, amount, input, name]) => {
        event
        .shapeless(Item.of(output, amount), input)
        .id(`kubejs:${name}_from_shapeless_crafting`)
    })
})