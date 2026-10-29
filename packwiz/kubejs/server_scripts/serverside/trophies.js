ItemEvents.modifyTooltips(event => {

    event.modify('kubejs:trophy_1', tooltip => {
        tooltip.removeLine(0);
        tooltip.insert(0, Text.gold('1st Place Trophy').italic(false));
        tooltip.add(Text.lightPurple('Congratulations on first place!').italic(false));
    });

    event.modify('kubejs:trophy_2', tooltip => {
        tooltip.removeLine(0);
        tooltip.insert(0, Text.darkGray('2nd Place Trophy').italic(false));
        tooltip.add(Text.lightPurple('Congratulations on second place!').italic(false));
    });

    event.modify('kubejs:trophy_3', tooltip => {
        tooltip.removeLine(0);
        tooltip.insert(0, Text.of('3rd Place Trophy').color(0xB87333).italic(false));
        tooltip.add(Text.lightPurple('Congratulations on third place!').italic(false));
    });
});