import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { EveDataProvider } from '../EveDataProvider';

import { HardwareListing } from './';

const meta: Meta<typeof HardwareListing> = {
  component: HardwareListing,
  tags: ['autodocs'],
  title: 'Component/HardwareListing',
};

export default meta;
type Story = StoryObj<typeof HardwareListing>;

const withEveDataProvider: Decorator<Record<string, never>> = (Story) => {
  return (
    <EveDataProvider>
      <div style={{height: "400px"}}>
        <Story />
      </div>
    </EveDataProvider>
  );
}

export const Default: Story = {
  decorators: [withEveDataProvider],
};
