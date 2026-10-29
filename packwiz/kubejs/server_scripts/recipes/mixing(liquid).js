ServerEvents.recipes((event) => {
  // [Output, [Ingredient(s)], Fluid, Amount, Name]
  const liquidmixing = [
    ["minecraft:redstone", ["create:cinder_flour", "minecraft:gunpowder"], "minecraft:lava", 150, "redstone"]
  ]

  liquidmixing.forEach(([output, ingredient, fluid, amount, name]) => {
    event.recipes.create
      .mixing(output, [ingredient, Fluid.of(fluid, amount)])
      .id(`kubejs:${name}_from_liquid_mixing`)
  })
})
