import React from 'react';
import { addons } from '@storybook/addons';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SELECT_STORY } from '@storybook/core-events';
import LinkTo from './link';

jest.mock('@storybook/addons');
jest.mock('global', () => ({
  document: {
    location: {
      origin: 'origin',
      pathname: 'pathname',
      search: 'search',
    },
  },
  // @ts-ignore
  window: global,
  __STORYBOOK_STORY_STORE__: {
    getSelection: jest.fn(() => ({ id: 1 })),
    fromId: jest.fn(() => ({})),
  },
}));

const mockChannel = () => ({
  emit: jest.fn(),
  on: jest.fn(),
  once: jest.fn(),
});
const mockAddons = (addons as unknown) as jest.Mocked<typeof addons>;

describe('LinkTo', () => {
  describe('render', () => {
    it('should render a link', async () => {
      const channel = mockChannel() as any;
      mockAddons.getChannel.mockReturnValue(channel);

      const { container } = render(
        <LinkTo kind="foo" story="bar">
          link
        </LinkTo>
      );

      await waitFor(() => {
        expect(screen.getByText('link')).toHaveAttribute(
          'href',
          'originpathname?search=&id=foo--bar'
        );
      });
      expect(container.firstChild).toMatchInlineSnapshot(`
        <a
          href="originpathname?search=&id=foo--bar"
        >
          link
        </a>
      `);
    });
  });

  describe('events', () => {
    it('should select the kind and story on click', () => {
      const channel = {
        emit: jest.fn(),
        on: jest.fn(),
      } as any;
      mockAddons.getChannel.mockReturnValue(channel);

      render(
        <LinkTo kind="foo" story="bar">
          link
        </LinkTo>
      );
      userEvent.click(screen.getByText('link'));

      expect(channel.emit).toHaveBeenLastCalledWith(
        SELECT_STORY,
        expect.objectContaining({
          kind: 'foo',
          story: 'bar',
        })
      );
    });
  });
});
