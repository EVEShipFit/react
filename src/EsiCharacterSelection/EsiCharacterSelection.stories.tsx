import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { EsiProvider } from '../EsiProvider';
import { EsiCharacterSelection } from './';

const meta: Meta<typeof EsiCharacterSelection> = {
  component: EsiCharacterSelection,
  tags: ['autodocs'],
  title: 'Component/EsiCharacterSelection',
};

export default meta;
type Story = StoryObj<typeof EsiCharacterSelection>;

const withEsiProvider: Decorator<Record<string, never>> = (Story) => {
  return (
    <EsiProvider>
      <Story />
    </EsiProvider>
  );
}

export const Default: Story = {
  args: {
  },
  decorators: [withEsiProvider],
};
