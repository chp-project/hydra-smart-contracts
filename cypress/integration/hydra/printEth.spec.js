/// <reference types="Cypress" />
const wallets = require('../../../e2e-testing/artifacts/wallets.json');

context('Ropsten Faucet Refills', () => {
  beforeEach(() => {
    cy.visit('https://faucet.ropsten.be/')
  })
  
  it('Submit Address(0)', () => {
    cy.wrap(wallets).each((currVal, idx, arr) => {
      cy.reload(true)
      cy.get('.input.is-primary').type(currVal.address);
      cy.get('.button.is-link').click();
    });
  })
})
