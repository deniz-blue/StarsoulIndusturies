ServerEvents.recipes((event) => {
    const emptyingrecipes = [
    // [Input, Output, Liquid, Amount, Name]
        ['brewinandchewin:beer','brewinandchewin:tankard','brewinandchewin:beer',250,'beer'],
        ['brewinandchewin:vodka', 'brewinandchewin:tankard', 'brewinandchewin:vodka', 250, 'vodka'],
        ['brewinandchewin:mead', 'brewinandchewin:tankard', 'brewinandchewin:mead', 250, 'mead'],
        ['brewinandchewin:rice_wine', 'brewinandchewin:tankard', 'brewinandchewin:rice_wine', 250, 'rice_wine'],
        ['brewinandchewin:pale_jane', 'brewinandchewin:tankard', 'brewinandchewin:pale_jane', 250, 'pale_jane'],
        ['brewinandchewin:egg_grog', 'brewinandchewin:tankard', 'brewinandchewin:egg_grog', 250, 'egg_grog'],
        ['brewinandchewin:glittering_grenadine', 'brewinandchewin:tankard', 'brewinandchewin:glittering_grenadine', 250, 'glittering_grenadine'],
        ['brewinandchewin:saccharine_rum', 'brewinandchewin:tankard', 'brewinandchewin:saccharine_rum', 250, 'saccharine_rum'],
        ['brewinandchewin:salty_folly', 'brewinandchewin:tankard', 'brewinandchewin:salty_folly', 250, 'salty_folly'],
        ['brewinandchewin:bloody_mary', 'brewinandchewin:tankard', 'brewinandchewin:bloody_mary', 250, 'bloody_mary'],
        ['brewinandchewin:red_rum', 'brewinandchewin:tankard', 'brewinandchewin:red_rum', 250, 'red_rum'],
        ['brewinandchewin:strongroot_ale', 'brewinandchewin:tankard', 'brewinandchewin:strongroot_ale', 250, 'strongroot_ale'],
        ['brewinandchewin:steel_toe_stout', 'brewinandchewin:tankard', 'brewinandchewin:steel_toe_stout', 250, 'steel_toe_stout'],
        ['brewinandchewin:dread_nog', 'brewinandchewin:tankard', 'brewinandchewin:dread_nog', 250, 'dread_nog'],
        ['brewinandchewin:withering_dross', 'brewinandchewin:tankard', 'brewinandchewin:withering_dross', 250, 'withering_dross'],
        ['brewinandchewin:kombucha', 'brewinandchewin:tankard', 'brewinandchewin:kombucha', 250, 'kombucha'],
    ]

    emptyingrecipes.forEach(([input, output, liquid, amount, name]) => {
        event.recipes.create.emptying(
            [
                Fluid.of(liquid, amount),
                Item.of(output)
            ],
            Item.of(input)
        )
        .id(`kubejs:${name}_from_emptying`);
    })
})