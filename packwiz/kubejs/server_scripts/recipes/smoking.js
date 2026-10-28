ServerEvents.recipes((event) => {
    // [Output, Input, Name]
    const smokingRecipes = [
        ["create:scorchia", "create:scoria", "scorchia"]
    ];
  
    smokingRecipes.forEach(([output, input, name]) => {
        event.recipes.minecraft
            .smoking(output, input)
            .id(`kubejs:${name}_from_smoking`);
    });
});

