module.exports = {
  extends: ["html-validate:recommended"],
  rules: {
    // Marko outputs attributes without quotes when safe
    "attr-quotes": "off",
    // Marko outputs <!doctype html> in lowercase by default
    "doctype-style": "off",
    // Zag adapter often renders ARIA-attributed generic elements rather than natives
    "prefer-native-element": "off",
    // Many components use inline styles for dynamic positioning (e.g. zag.js elements)
    "no-inline-style": "off",
    // Zag.js generates IDs with colons and other characters
    "valid-id": "off",
    // Preview layouts might render multiple mains in docs context
    "no-multiple-main": "off",
    // Docs contain raw characters in code snippets
    "no-raw-characters": "off",
    // Marko sometimes produces uppercase custom attributes
    "attr-case": "off",
    // Generic text-content checks often flag Marko templating logic
    "text-content": "off",
    // Components reuse landmarks in a way that sometimes duplicates them
    "unique-landmark": "off",
    // Zag sometimes outputs redundant ARIA roles on natives
    "no-redundant-role": "off",
    // Docs demos don't need real password autocomplete
    "autocomplete-password": "off"
  }
};
