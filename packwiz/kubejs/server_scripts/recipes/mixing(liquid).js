ServerEvents.recipes((event) => {
  // [[Output(s)], [Ingredient(s)], Fluid, Amount, Name]
  const liquidmixing = [
    [["minecraft:redstone"], ["create:cinder_flour", "minecraft:gunpowder"], "minecraft:lava", 150, "redstone"],
    [["minecraft:sculk", "minecraft:sculk_catalyst"], ["minecraft:sculk_catalyst"], "create_enchantment_industry:experience", 50, "sculk"]
  ]

  liquidmixing.forEach(([output, ingredient, fluid, amount, name]) => {
    event.recipes.create
      .mixing(output, [ingredient, Fluid.of(fluid, amount)])
      .id(`kubejs:${name}_from_liquid_mixing`)
  })
})
