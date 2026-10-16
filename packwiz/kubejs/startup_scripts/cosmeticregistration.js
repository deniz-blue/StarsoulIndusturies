const HELMET_COUNT = 1;
const BACK_COUNT = 0;
const cosmeticItems = [];

for (let i = 1; i <= HELMET_COUNT; i++) {
    cosmeticItems.push(`kubejs:helmet_cosmetic_${i}`);
}

for (let i = 1; i <= BACK_COUNT; i++) {
    cosmeticItems.push(`kubejs:back_cosmetic_${i}`);
}

StartupEvents.registry('creative_mode_tab', event => {
    event.create('cosmetics')
        .displayName('Cosmetics')
        .icon(() => 'minecraft:turtle_helmet')
        .content(() => cosmeticItems);
});

StartupEvents.registry('item', event => {
        for (let i = 1; i <= HELMET_COUNT; i++) {
        event.create(`helmet_cosmetic_${i}`, 'anim_helmet')
            .displayName(`Helmet Cosmetic ${i}`)
            .material('iron')
            .defaultGeoModel()
            .armorItemUseGeoModel()
            .unstackable();
    }

    for (let i = 1; i <= BACK_COUNT; i++) {
        event.create(`back_cosmetic_${i}`, 'anim_chestplate')
            .displayName(`Back Cosmetic ${i}`)
            .material('iron')
            .defaultGeoModel()
            .armorItemUseGeoModel()
            .unstackable();
    }
})

StartupEvents.registry('block', event => {
        event.create(`trophy_1`)
            .displayName(`1st Place Trophy`)
            .stoneSoundType()
            .tagBlock('create:wrench_pickup')
            .hardness(1.5)
            .resistance(1200)
            .notSolid()
		.renderType('cutout');

        event.create(`trophy_2`)
            .displayName(`2nd Place Trophy`)
            .stoneSoundType()
            .tagBlock('create:wrench_pickup')
            .hardness(1.5)
            .resistance(1200)
            .notSolid()
		.renderType('cutout');

        event.create(`trophy_3`)
            .displayName(`3rd Place Trophy`)
            .stoneSoundType()
            .tagBlock('create:wrench_pickup')
            .hardness(1.5)
            .resistance(1200)
            .notSolid()
		.renderType('cutout');
})

StartupEvents.modifyCreativeTab('kubejs:tab', event => {
    for (const item of cosmeticItems) {
        event.remove(item);
    }
});
