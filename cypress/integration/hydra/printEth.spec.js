/// <reference types="Cypress" />
let wallets = require('../../../e2e-testing/artifacts/wallets.json');
wallets = [wallets[0]];

context('Ropsten Faucet Refills', () => {
  beforeEach(() => {
    cy.visit('https://faucet.ropsten.be/')
  })
  
  it('Submit Address(0)', () => {
    cy.wrap(wallets).each((currVal, idx, arr) => {
      cy.reload(true)
      cy.get('.input.is-primary').type(currVal.address);
      cy.get('.button.is-link').click();
      cy.wait(1000);
    });
  })
})
