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
