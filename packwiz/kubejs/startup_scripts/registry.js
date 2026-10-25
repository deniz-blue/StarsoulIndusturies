StartupEvents.registry('block', event => {
    event.create('charcoal_block')
        .displayName("Block of Charcoal")
        .stoneSoundType()
        .tagBoth('aeronautics:burner_fire')
        .tagBoth('aeronautics:levitite_adjacent_catalyzer')
        .tagBoth('bits_n_bobs:super_heavy')
        .tagBoth('c:storage_blocks')
        .tagBoth('c:storage_blocks/coal')
        .tagBlock('dndesires:mineable_with_drill')
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBoth('minecraft:sulfur_cube_archetype/regular')
        .tagBoth('minecraft:sulfur_cube_swallowable')
        .tagBoth('sable:super_heavy')
        .requiresTool(true)
        .hardness(5)
        .resistance(6)
        .mapColor('color_black')
        .instrument('basedrum');
});

ItemEvents.modification(event => {
    event.modify('kubejs:charcoal_block', item => {
        item.burnTime = 16000;
    });
});

//create hid all this stuff smh
StartupEvents.modifyCreativeTab('minecraft:ingredients', event => {
    event.add('create:chromatic_compound')
    event.add('create:shadow_steel')
    event.add('create:refined_radiance')
})

StartupEvents.modifyCreativeTab('minecraft:building_blocks', event => {
    event.add('create:shadow_steel_casing')
    event.add('create:refined_radiance_casing')
})

