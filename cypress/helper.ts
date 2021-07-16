/* eslint-disable @typescript-eslint/no-unused-expressions, jest/valid-expect */
type StorybookApps = 'official-storybook';

type Addons = 'Actions' | 'Knobs';

const getUrl = (route: string) => {
  const host = Cypress.env('location') || 'http://localhost:8001';

  return `${host}/${route}`;
};

export const visit = (route = '') =>
  cy
    .clearLocalStorage()
    .visit(getUrl(route))
    .get(`#storybook-preview-iframe`)
    .then({ timeout: 15000 }, (iframe) =>
      cy.wrap(iframe, { timeout: 10000 }).should(() => {
        const content: Document | null = (iframe[0] as HTMLIFrameElement).contentDocument;
        const element: HTMLElement | null = content !== null ? content.documentElement : null;

        expect(element).not.null;

        if (element !== null) {
          expect(element.querySelector('#root > *')).not.null;
        }
      })
    );

export const clickAddon = (addonName: Addons) =>
  cy.get(`[role=tablist] button[role=tab]`).contains(addonName).click();

export const getStorybookPreview = () =>
  cy.get(`#storybook-preview-iframe`).then({ timeout: 10000 }, (iframe) => {
    const content: Document | null = (iframe[0] as HTMLIFrameElement).contentDocument;
    const element: HTMLElement | null = content !== null ? content.documentElement : null;

    return cy
      .wrap(iframe)
      .should(() => {
        expect(element).not.null;

        if (element !== null) {
          expect(element.querySelector('#root > *')).not.null;
        }
      })
      .then(() => cy.wrap(element).get('#root'));
  });
