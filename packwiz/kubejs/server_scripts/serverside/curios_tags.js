
ServerEvents.tags('item', event => {
    for (let i = 1; i <= 150; i++) {
        event.add('curios:cosmetic_head', `kubejs:helmet_cosmetic_${i}`);
    }

    for (let i = 1; i <= 50; i++) {
        event.add('curios:cosmetic_chest', `kubejs:back_cosmetic_${i}`);
    }

    event.add('curios:head', 'create:goggles');
    event.add('curios:head', 'aeronautics:aviators_goggles');

});
