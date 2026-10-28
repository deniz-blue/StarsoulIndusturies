ServerEvents.recipes((event) => {
    // [Output, Amount, [Input], Name]
    const shapelessrecipe = [
        ["kubejs:charcoal_block", 1, ["9x minecraft:charcoal"], "charcoal_block"],
        ["minecraft:charcoal", 9, ["kubejs:charcoal_block"], "charcoal"],
    ]

    shapelessrecipe.forEach(([output, amount, input, name]) => {
        event
        .shapeless(Item.of(output, amount), input)
        .id(`kubejs:${name}_from_shapeless_crafting`)
    })
})