import global from 'global';

const { window, EventSource } = global;

export {
  storiesOf,
  setAddon,
  addDecorator,
  addParameters,
  configure,
  getStorybook,
  forceReRender,
  raw,
} from './preview';

export {
  getCustomElements,
  setCustomElements,
  setCustomElementsManifest,
  isValidComponent,
  isValidMetaData,
} from './customElements';

export * from './preview/types-6-0';

// TODO: disable HMR and do full page loads because of customElements.define
if (module && module.hot && module.hot.decline) {
  module.hot.decline();

  // forcing full reloads for customElements as elements can only be defined once per page
  const hmr = new EventSource('__webpack_hmr');
  hmr.addEventListener('message', (event: { data: string }) => {
    try {
      // Only care for built events.  Heartbeats are not parsable so we ignore those
      const { action } = JSON.parse(event.data);
      if (action === 'built') {
        window.location.reload();
      }
    } catch (error) {
      // Most part we only get here from the data in the server-sent event not being parsable which is ok
    }
  });
}
