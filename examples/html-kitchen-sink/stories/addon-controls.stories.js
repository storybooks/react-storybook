export default {
  title: 'Addons/Controls',
  argTypes: {
    label: { type: { name: 'string' } },
  },
};

const Template = ({ label }) => `<div>${label}</div>`;

export const Hello = Template.bind({});
Hello.args = { label: 'Hello!' };

export const Bonjour = Template.bind({});
Bonjour.args = { label: 'Bonjour!' };
