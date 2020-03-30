import Papa from "papaparse";
describe("Build filter links", function() {
  before(() => {
    console.log("Lets GO");
  });

  this.beforeEach(() => {
    console.log("Setting up cookie");
    cy.setCookie("li_at", Cypress.env("it_at"));
  });

  let listName = Cypress.env("listname");

  it("Make Sales Nav auth and filter", function() {
    if (!listName) {
      console.error("Please specify --env listname=... param");
      return;
    }

    cy.task("readJSONFileMaybe", "cypress/state/" + listName + ".json").then(
      doneList => {
        cy.fixture("crunchbase-lists/" + listName).then(async companiesCsv => {
          var companies = Papa.parse(companiesCsv, {
            header: true
          });

          companies.data.forEach(async company => {
            // console.log(company['Organization Name'], company['LinkedIn']);

            if (!company["LinkedIn"]) {
              return;
            }

            const linkedInProfile = company["LinkedIn"]
              .replace("http:", "https:")
              .replace("in.linkedin.com", "www.linkedin.com")
              .replace("il.linkedin.com", "www.linkedin.com");

            function saveToState() {
              cy.task(
                "readJSONFileMaybe",
                "cypress/state/" + listName + ".json"
              ).then(json => {
                cy.writeFile(
                  "cypress/state/" + listName + ".json",
                  (json || []).concat([linkedInProfile])
                );
              });
            }

            if ((doneList || []).includes(linkedInProfile)) {
              console.log(company["Organization Name"] + " already done");
              return;
            }

            // Visit a  proper company page
            cy.visit(linkedInProfile, { failOnStatusCode: false });
            // cy.wait(1000);

            cy.get("body")
              .then($body => $body.find(".org-top-card-overflow"))
              .then($el => {
                if ($el.length === 0) {
                  console.log(
                    "No details page. Cannot save " +
                      company["Organization Name"]
                  );

                  saveToState();

                  return;
                }
                cy.get(".org-top-card-overflow").click();

                cy.get("body")
                  .then($body =>
                    $body.find(
                      '.org-top-card-overflow [data-control-name="topcard_view_in_sales_navigator"]'
                    )
                  )
                  .then($el => {
                    // console.log($el);
                    if ($el.length === 0) {
                      console.log(
                        "No link to SalesNav. Cannot save " +
                          company["Organization Name"]
                      );
                      saveToState();
                      return;
                    }

                    cy.get(
                      ".org-top-card-overflow .artdeco-dropdown__content-inner ul"
                    )
                      .contains("View in Sales Navigator")
                      .invoke("removeAttr", "target")
                      .click({ force: true });

                    cy.location("pathname", { timeout: 10000 }).should(
                      "include",
                      "/sales"
                    );

                    cy.get("body")
                      .then($body =>
                        $body.find(
                          ".right div.company-topcard-actions div.save-to-list-dropdown button"
                        )
                      )
                      .then($el => {
                        if ($el.length === 0) {
                          console.log(
                            "Already saved. Cannot save " +
                              company["Organization Name"]
                          );

                          saveToState();
                          return;
                        }

                        cy.get(".header-wrapper").click();

                        // artdeco-dropdown__content-inner
                        cy.get(
                          ".right div.company-topcard-actions div.save-to-list-dropdown"
                        ).click({ force: true });
                        cy.get(
                          ".right div.company-topcard-actions div.save-to-list-dropdown button"
                        ).click({ force: true });

                        cy.waitUntil(
                          () =>
                            cy.contains("Create account list", {
                              timeout: 10000
                            }),
                          {
                            errorMsg: "This is a custom error message", // overrides the default error message
                            timeout: 10000, // waits up to 2000 ms, default to 5000
                            interval: 500 // performs the check every 500 ms, default to 200
                          }
                        );

                        const dropContainerSelector =
                          "div.company-topcard-actions div.save-to-list-dropdown__content-container";

                        cy.get("body").then($body => {
                          var $listContainer = $body.find(
                            dropContainerSelector + " ul"
                          );
                          // console.log($listContainer);
                          //   console.log('TEXT:', $listContainer.text());
                          if ($listContainer.text().includes(listName)) {
                            cy.get(dropContainerSelector).contains("maximum");
                            cy.get(dropContainerSelector)
                              .scrollIntoView()
                              .contains(listName, { timeout: 10000 })
                              .parent()
                              .click();

                            cy.contains("was saved successfully", {
                              timeout: 10000
                            }).should("be.visible");
                            saveToState();
                          } else {
                            cy.get(dropContainerSelector)
                              .contains("Create account list", {
                                timeout: 10000
                              })
                              .click();
                            cy.wait(300);
                            cy.get(
                              "input[placeholder='E.g. Q4 Accounts']"
                            ).type(listName);
                            cy.contains("Create and save").click();
                            cy.get(".button-secondary-large-muted").should(
                              "contain",
                              "Saved"
                            );
                            saveToState();
                          }
                        });
                      });
                  });
              });
          });
        });
      }
    );
  });
});
