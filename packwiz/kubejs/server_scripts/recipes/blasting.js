ServerEvents.recipes((event) => {
    const blastingRecipes = [
        // [Input, Output, Name]
        ["minecraft:soul_sand", "create:scoria", "scoria"],
        ["create:chromatic_compound", "create:refined_radiance", "chromatic_compound_to_refined_radiance"],
        ["create:shadow_steel", "create:refined_radiance", "shadow_steel_to_refined_radiance"],
        ["create:shadow_steel_casing", "create:refined_radiance_casing", "shadow_steel_casing_to_refined_radiance_casing"]
    ];

    blastingRecipes.forEach(([input, output, name]) => {
        event.recipes.minecraft
            .blasting(output, input)
            .id(`kubejs:${name}_from_blasting`);
    });

})