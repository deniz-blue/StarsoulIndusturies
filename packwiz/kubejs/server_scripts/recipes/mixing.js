ServerEvents.recipes((event) => {
  // [Output, [Ingredient(s)], Name]
  const mixingrecipe = [
    ["minecraft:tuff", ["minecraft:stone", "minecraft:cobblestone", "minecraft:quartz"], "Tuff"]
  ]

  mixingrecipe.forEach(([output, ingredient, name]) => {
    event.recipes.create
      .mixing(output, [ingredient])
      .id(`kubejs:${name}_from_mixing`)
  })
})