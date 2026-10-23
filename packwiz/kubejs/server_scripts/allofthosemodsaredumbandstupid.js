ServerEvents.recipes(event => {
  [
    "aeroworks",
    "create_security",
    "createbigcannons",
    "compactflap",
    "numismatics",
    "create_radar",
  ].forEach(mod => event.remove({ output: `@${mod}` }));
});