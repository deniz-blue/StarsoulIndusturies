ServerEvents.recipes((event) => {
    // [Output, Item, Block, Name]
    const itemApplicationRecipes = [
        ["create:shadow_steel_casing", "create:shadow_steel", "c:stripped_woods", "shadow_steel_casing_a"],
        ["create:shadow_steel_casing", "create:shadow_steel", "c:stripped_logs", "shadow_steel_casing_b"],
        ["create:refined_radiance_casing", "create:refined_radiance", "c:stripped_woods", "refined_radiance_casing_a"],
        ["create:refined_radiance_casing", "create:refined_radiance", "c:stripped_logs", "refined_radiance_casing_b"]
    ];

    itemApplicationRecipes.forEach(([output, item, block, name]) => {
        event.custom({
            "type": "create:item_application",
            "ingredients": [
                {
                    "tag": block
                },
                {
                    "item": item
                }
            ],
            "results": [
                {
                    "id": output
                }
            ]
        }).id(`kubejs:${name}_from_item_application`);
    });
});
