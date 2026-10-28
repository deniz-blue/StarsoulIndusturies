ServerEvents.recipes((event) => {
    // [Output, Input, Name]
    const hauntingRecipes = [
        ["create:shadow_steel", "create:chromatic_compound", "chromatic_compound_to_shadow_steel"],
        ["create:shadow_steel", "create:refined_radiance", "refined_radiance_to_shadow_steel"],
        ["create:shadow_steel_casing", "create:refined_radiance_casing", "refined_radiance_casing_to_shadow_steel_casing"],
        ["minecraft:netherrack", "minecraft:basalt", "netherrack_from_haunting"]
    ];
    hauntingRecipes.forEach(([output, input, name]) => {
      event.recipes.create
        .haunting(output, input)
        .id(`kubejs:${name}_from_haunting`);
    });
})
