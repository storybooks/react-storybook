describe('addon-backgrounds', () => {
  before(() => {
    cy.visitStorybook();
  });

  it('should have a dark background', () => {
    // click on the button
    cy.navigateToStory('example-button', 'primary');

    // Click on the addon and select dark background
    cy.get('[title="Change the background or CSS of the preview]').click();
    cy.get('#dark').click();

    cy.getCanvasBodyElement().should('have.css', 'background-color', 'rgb(51, 51, 51)');
  });

  it('should apply a grid', () => {
    // click on the button
    cy.navigateToStory('example-button', 'primary');

    // Toggle grid view
    cy.get('[title="Apply a grid to the preview"]').click();

    cy.getCanvasBodyElement().should('have.css', 'background-image');
  });
});
