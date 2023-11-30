import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { EsiProvider } from '../EsiProvider';
import { EsiCharacterSelection } from './';
import { EveDataProvider } from '../EveDataProvider';

const meta: Meta<typeof EsiCharacterSelection> = {
  component: EsiCharacterSelection,
  tags: ['autodocs'],
  title: 'Component/EsiCharacterSelection',
};

export default meta;
type Story = StoryObj<typeof EsiCharacterSelection>;

const withEsiProvider: Decorator<Record<string, never>> = (Story) => {
  return (
    <EveDataProvider>
      <EsiProvider setSkills={console.log}>
        <Story />
      </EsiProvider>
    </EveDataProvider>
  );
}

export const Default: Story = {
  args: {
  },
  decorators: [withEsiProvider],
};
