ServerEvents.recipes(event => {
    // [Output, Input, Name]
    const cuttingboardrecipe = [
        ["minecraft:stripped_pale_oak_log", "minecraft:pale_oak_log", "stripped_pale_oak_log"],
        ["minecraft:stripped_pale_oak_wood", "minecraft:pale_oak_wood", "stripped_pale_oak_wood"],
        ["minecraft:stripped_poplar_log", "minecraft:poplar_log", "stripped_poplar_log"],
        ["minecraft:stripped_poplar_wood", "minecraft:poplar_wood", "stripped_poplar_wood"]
    ]

    cuttingboardrecipe.forEach(([output, input, name]) => {
        event.custom({
            "type": "farmersdelight:cutting",
            "ingredients": [
                {
                "item": input
                }
            ],
            "result": [
                {
                "item": {
                    "count": 1,
                    "id": output
                }
                },
                {
                "item": {
                    "count": 1,
                    "id": "farmersdelight:tree_bark"
                }
                }
            ],
            "sound": {
                "sound_id": "minecraft:item.axe.strip"
            },
            "tool": [
                {
                "type": "farmersdelight:item_ability",
                "action": "axe_strip"
                },
                {
                "tag": "minecraft:axes"
                }
            ]
        })
        .id(`kubejs:${name}_from_cutting_board`)
    })
})