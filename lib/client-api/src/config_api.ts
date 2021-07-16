/* eslint no-underscore-dangle: 0 */
import { StoryStore } from './story_store';

export default class ConfigApi {
  _storyStore: StoryStore;

  constructor({ storyStore }: { storyStore: StoryStore }) {
    this._storyStore = storyStore;
  }

  configure = (loaders: () => void, module: NodeModule, showDeprecationWarning = true) => {
    this._storyStore.startConfiguring();

    try {
      loaders();

      this._storyStore.clearError();
    } catch (err) {
      this._storyStore.setError(err);
    }
    this._storyStore.finishConfiguring();
  };
}
