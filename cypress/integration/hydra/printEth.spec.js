/// <reference types="Cypress" />

const wallets = ["0xae9d2422c95c2253eef6c015705c3777992f1959"]

context('Ropsten Faucet Refills', () => {
  beforeEach(() => {
    cy.visit('https://faucet.ropsten.be/')
  })
  
  it('Submit Address(0)', () => {
    cy.wrap(wallets).each((currVal, idx, arr) => {
      cy.reload(true)
      cy.get('.input.is-primary').type(currVal);
      cy.get('.button.is-link').click();
      cy.wait(1000);
    });
  })
})
