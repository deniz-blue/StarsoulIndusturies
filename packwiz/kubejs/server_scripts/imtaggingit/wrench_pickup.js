ServerEvents.tags('block', event => {
    // Block name
    const wrench_pickup_blocks = [
        "#c:chests/wooden",
        "#minecraft:copper_chests",
        "minecraft:crafting_table",
        "#c:villager_job_sites",
        "create:schematicannon",
        "create:schematic_table",
        "minecraft:barrel",
        "farmersdelight:cooking_pot",
        "farmersdelight:stove",
        "#minecraft:signs",
        "#minecraft:hanging_signs",
        "aeroclaims:claim_block",
        "#minecraft:anvil",
        "minecraft:enchanting_table",
        "#create:seats",
        "#createadditionallogistics:short_seats",
        "#createadditionallogistics:tall_seats",
        "interiors:kelp_seat"
    ]

    wrench_pickup_blocks.forEach(wrenchable => {
        event.add('create:wrench_pickup', wrenchable)
    })

})