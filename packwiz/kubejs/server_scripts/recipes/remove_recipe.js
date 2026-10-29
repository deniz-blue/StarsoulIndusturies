ServerEvents.recipes((event) => {
    event.remove({id:"createcasing:crafting/fluid_pipe/brass_vertical"})
    event.remove({id:"create_connected:crafting/kinetics/item_silo"})
    event.remove({
      type: "create:sequenced_assembly",
     output: "railways:track_monorail"
    })
    event.remove({
      type: "create:pressing",
      output: "createdeco:brass_coin"
    })
    event.remove({id:"pipeorgans:crafting/tuning_wire"})
    event.remove({id:"minecraft:copper_chain"})
    event.remove({id:"minecraft:copper_lantern"})
    event.remove({id:"createpropulsion:crafting/liquid_vector_thruster"})
    event.remove({id:"minecraft:copper_torch"})
    event.remove({id:"jei:/createdeco/pressing/coins/copper_coin"})
})