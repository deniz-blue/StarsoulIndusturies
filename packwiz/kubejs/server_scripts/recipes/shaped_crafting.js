ServerEvents.recipes((event) => {
//Fake egg
  event.shaped(
    Item.of(`minecraft:dragon_egg[custom_name='{"italic":false,"text":"Fake Dragon Egg"}',rarity="rare"]`, 4),
    [
        'ABA',
        'BCB',
        'ABA'
    ],
      {
          A: "minecraft:crying_obsidian",
          B: "minecraft:nether_star",
          C: "minecraft:dragon_egg"
      }
  )

  //Invisible Item Frame
  event.shaped(
    Item.of('minecraft:item_frame[minecraft:entity_data={id:"minecraft:item_frame",Invisible:1b},minecraft:custom_name=\'{"text":"Invisible Item Frame","italic":false}\']', 1),
    [
        'BBB',
        'BAB',
        'BBB'
    ],
    {
        A: 'minecraft:item_frame',
        B: 'minecraft:glass_pane'
    }
  );

  //Invisible Glow Item Frame
  event.shaped(
    Item.of('minecraft:glow_item_frame[minecraft:entity_data={id:"minecraft:glow_item_frame",Invisible:1b},minecraft:custom_name=\'{"text":"Invisible Glow Item Frame","italic":false}\']'),
    [
        'BBB',
        'BAB',
        'BBB'
    ],
    {
        A: 'minecraft:glow_item_frame',
        B: 'minecraft:glass_pane'
    }
  );

  //Grass Block
  event.shaped(
    Item.of('minecraft:grass_block', 1),
    [
        'A',
        'B'
    ],
    {
      A: 'minecraft:wheat_seeds',
      B: 'minecraft:dirt'
    }
  );
})