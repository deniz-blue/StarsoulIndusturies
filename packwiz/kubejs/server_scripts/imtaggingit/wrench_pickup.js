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
    ]

    wrench_pickup_blocks.forEach(wrenchable => {
        event.add('create:wrench_pickup', wrenchable)
    })

})