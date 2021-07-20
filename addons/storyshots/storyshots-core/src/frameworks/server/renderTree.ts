import { document, Node } from 'global';
import fetch from 'node-fetch';

let fetchStoryHtml = async (url: string, path: string, params: any) => {
  const fetchUrl = new URL(`${url}/${path}`);
  fetchUrl.search = new URLSearchParams(params).toString();

  const response = await fetch(fetchUrl);
  return response.text();
};

async function getRenderedTree(story: { id: any, render: () => any, parameters: any, storyFn: any }) {
  const {
    server: { url, id: storyId, params },
  } = story.parameters;

  const storyParams = story.storyFn();
  const fetchId = storyId || story.id;
  const fetchParams = { ...params, ...storyParams };
  const storyHtml = await fetchStoryHtml(url, fetchId, fetchParams);

  const section: HTMLElement = document.createElement('section');
  section.innerHTML = storyHtml;

  if (section.childElementCount > 1) {
    return section;
  }

  return section.firstChild;
}

export default getRenderedTree;
