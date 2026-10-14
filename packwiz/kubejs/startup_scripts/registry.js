
const HELMET_COUNT = 150;
const TROPHY_COUNT = 100;
const BACK_COUNT = 50;

const cosmeticItems = [];

for (let i = 1; i <= HELMET_COUNT; i++) {
    cosmeticItems.push(`kubejs:helmet_cosmetic_${i}`);
}

for (let i = 1; i <= BACK_COUNT; i++) {
    cosmeticItems.push(`kubejs:back_cosmetic_${i}`);
}

for (let i = 1; i <= TROPHY_COUNT; i++) {
    cosmeticItems.push(`kubejs:trophy_${i}`);
}

StartupEvents.registry('creative_mode_tab', event => {
    event.create('cosmephie')
        .displayName('Cosmetics and Trophies')
        .icon(() => 'minecraft:turtle_helmet')
        .content(() => cosmeticItems);
});

StartupEvents.registry('item', event => {
    for (let i = 1; i <= HELMET_COUNT; i++) {
        event.create(`helmet_cosmetic_${i}`)
            .displayName(`Helmet Cosmetic ${i}`)
            .unstackable();
    }

    for (let i = 1; i <= BACK_COUNT; i++) {
        event.create(`back_cosmetic_${i}`)
            .displayName(`Back Cosmetic ${i}`)
            .unstackable();
    }

    event.create('incomplete_cog', 'create:sequenced_assembly');

    event.create('malformed_cog')
        .displayName('Malformed Cog')
        .unstackable()
        .tooltip(Text.gray('Whoops!'));

    event.create('unprocessed_cog')
        .displayName('Unprocessed Cog')
        .unstackable();
});

StartupEvents.modifyCreativeTab('kubejs:tab', event => {
    for (const item of cosmeticItems) {
        event.remove(item);
    }
});

StartupEvents.registry('block', event => {
    for (let i = 1; i <= TROPHY_COUNT; i++) {
        event.create(`trophy_${i}`)
            .displayName(`Trophy ${i}`)
            .stoneSoundType()
            .tagBlock('create:wrench_pickup')
            .hardness(1.5)
            .resistance(6);
    }

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
