import { ReactFunctionalComponent, ReactClassComponent } from '../React';

export default {
  title: 'React Compatibility',
};

export const ReactComponentDemo = () => (
  <div>
    <h1>React component demo</h1>
    <ReactFunctionalComponent label="This is a React functional component rendered by Preact" />
    <hr />
    <ReactClassComponent label="This is a React class component rendered by Preact" />
  </div>
);
