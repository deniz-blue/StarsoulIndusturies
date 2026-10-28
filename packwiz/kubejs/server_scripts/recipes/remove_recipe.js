ServerEvents.recipes((event) => {
    event.remove({id:"createcasing:crafting/fluid_pipe/brass_vertical"})
    event.remove({id:"create_connected:crafting/kinetics/item_silo"})
    event.remove({
    type: "create:sequenced_assembly",
    output: "railways:track_monorail"
  })
})