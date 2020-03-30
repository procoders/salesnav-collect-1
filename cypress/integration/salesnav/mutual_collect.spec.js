import Papa from "papaparse";

describe("Build mutual contracts", function() {
  before(() => {
    console.log("Lets GO");
  });

  this.beforeEach(() => {
    console.log("Setting up cookie");
    cy.setCookie("li_at", cy.setCookie("li_at", Cypress.env("it_at")));
  });

  const searchUrl = Cypress.env("searchurl");
  const projectName = Cypress.env("listname");

  function parseAndSaveContacts(callback = () => {}) {
    cy.get("#results").should("be.visible");

    cy.get("body")
      .then($body => $body.find(".search-results__pagination-list")) //search-results__no-results-message
      .then($el => {
        if ($el.length === 0) {
          console.log("No contacts connections there");
          return;
        }
        cy.get(".search-results__pagination-list").scrollIntoView({
          duration: 4000
        });

        cy.get("li.search-results__result-item")
          .then($li => {
            let records = [];
            for (let idx = 0; idx < $li.length; idx++) {
              const names = $li.eq(idx).find(".result-lockup__name a");
              const positions = $li
                .eq(idx)
                .find(".result-lockup__highlight-keyword span.t-14");
              const companiesLinks = $li
                .eq(idx)
                .find(".result-lockup__position-company a");
              const companiesNames = $li
                .eq(idx)
                .find(".result-lockup__position-company a>span:first");

              records.push([
                names[0].textContent.trim(),
                positions[0] ? positions[0].textContent.trim() : "",
                companiesNames[0] ? companiesNames[0].textContent.trim() : "",
                names[0].href,
                companiesLinks[0] ? companiesLinks[0].href : "",
                names[0].href.replace(
                  "sales/people",
                  "sales/search/people/list/shared-connections"
                )
              ]);
            }
            console.log(
              $li.length + " / " + records.length + " contacts will be saved"
            );

            return records;
          })
          .then(records => {
            callback(records);
          });

        cy.get(".search-results__pagination-list li:last")
          // .should("not.have.class", "selected")
          .then($lastPageLink => {
            if ($lastPageLink[0].className !== "selected cursor-pointer") {
              cy.get(".search-results__pagination-next-button")
                .click()
                .wait(2000);
              parseAndSaveContacts(callback);
            }
          }); //pause()
      });
  }

  it("Search and collect contacts", function() {
    if (Cypress.env("skip_collect")) return;
    cy.visit(searchUrl, { failOnStatusCode: false });

    parseAndSaveContacts(records => {
      cy.writeFile(
        "cypress/fixtures/contacts/contacts-" + projectName + ".csv",
        records
          .map(record => record.map(el => '"' + el + '"').join(","))
          .join("\n"),
        {
          flag: "a+"
        }
      );
    });
  });

  it("Obtaining mutuals of contacts", () => {
    cy.task(
      "readCSVFileMaybe",
      "cypress/fixtures/contacts/mutuals-" + projectName + ".csv"
    ).then(mutualsDoneData => {
      let mutualsDoneLinks = mutualsDoneData.map(m => m[3]);
      let step = 0;
      cy.fixture("contacts/contacts-" + projectName).then(contactsCsv => {
        let contacts = Papa.parse(contactsCsv, {
          header: false
        });

        contacts.data.forEach(contact => {
          step++;
          cy.log("Step " + step + " / " + contacts.data.length);

          const mutualsLink = contact[5];
          //profile list chcek
          if (mutualsDoneLinks.includes(contact[3])) {
            console.log(contact[0] + " already done. Skip it");
            return;
          }
          cy.visit(mutualsLink);

          parseAndSaveContacts(records => {
            cy.writeFile(
              "cypress/fixtures/contacts/mutuals-" + projectName + ".csv",
              records
                .map(record =>
                  contact
                    .concat(record)
                    .map(el => '"' + el + '"')
                    .join(",")
                )
                .join("\n") + "\n",
              {
                flag: "a+"
              }
            );
          });
          // cy.pause();
        });
      });
    });
  });
});
