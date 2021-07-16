import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useGlobals } from '@storybook/client-api';

// eslint-disable-next-line react/prop-types
const ArgUpdater = ({ args, updateArgs }) => {
  const [argsInput, updateArgsInput] = useState(JSON.stringify(args));

  return (
    <div>
      <h3>Hooks args:</h3>
      <pre>{JSON.stringify(args)}</pre>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateArgs(JSON.parse(argsInput));
        }}
      >
        <textarea value={argsInput} onChange={(e) => updateArgsInput(e.target.value)} />
        <br />
        <button type="submit">Change</button>
      </form>
    </div>
  );
};

export default {
  title: 'Core/Global Args',
  parameters: { passArgsFirst: false },
  decorators: [
    (story) => {
      const [globals, updateGlobals] = useGlobals();

      return (
        <>
          {story()}
          <ArgUpdater args={globals} updateArgs={updateGlobals} />
        </>
      );
    },
  ],
};

export const PassedToStory = ({ globals }) => (
  <div>
    <h3>Global args:</h3>
    <pre>{JSON.stringify(globals)}</pre>
  </div>
);

PassedToStory.propTypes = {
  globals: PropTypes.shape({}).isRequired,
};

export const SecondStory = ({ globals }) => (
  <div>
    <h3>Global args (2):</h3>
    <pre>{JSON.stringify(globals)}</pre>
  </div>
);

SecondStory.propTypes = {
  globals: PropTypes.shape({}).isRequired,
};
