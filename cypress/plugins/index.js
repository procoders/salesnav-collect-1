/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)


const fs = require('fs')
const Papa = require("papaparse");

/**
 * @type {Cypress.PluginConfig}
 */

module.exports = (on, config) => {
  on('task', {
    readJSONFileMaybe (filename) {
      if (fs.existsSync(filename)) {
        return JSON.parse(fs.readFileSync(filename, 'utf8'));
      }
console.log('!',filename)
      return null
    },
    readCSVFileMaybe (filename, header = false) {
      if (fs.existsSync(filename)) {
        let parsedResults = Papa.parse(fs.readFileSync(filename, 'utf8'), {
          header
        });
        return parsedResults.data;
      }

      return []
    },
    // appendToFile(filename, content) {
    //   cy.writeFile(filename, 'Hello World', {flag: "a+"});
    // }

  })

  require('cypress-log-to-output').install(on)

}