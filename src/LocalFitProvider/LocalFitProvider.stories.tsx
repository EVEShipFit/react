import type { Meta, StoryObj } from '@storybook/react';
import React from "react";

import { LocalFitContext, LocalFitProvider } from './';

const meta: Meta<typeof LocalFitProvider> = {
  component: LocalFitProvider,
  tags: ['autodocs'],
  title: 'Provider/LocalFitProvider',
};

export default meta;
type Story = StoryObj<typeof LocalFitProvider>;

const TestLocalFit = () => {
  const localFit = React.useContext(LocalFitContext);

  if (!localFit.loaded) {
    return (
      <div>
        LocalFit: loading<br/>
      </div>
    );
  }

  return (
    <div>
      LocalFit: loaded<br/>
      <pre>{JSON.stringify(localFit, null, 2)}</pre>
    </div>
  );
}

export const Default: Story = {
  args: {
  },
  render: (args) => (
    <LocalFitProvider {...args}>
      <TestLocalFit />
    </LocalFitProvider>
  ),
};
