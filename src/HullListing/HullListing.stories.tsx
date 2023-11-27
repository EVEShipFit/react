import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { EsiProvider } from '../EsiProvider';
import { HullListing } from './';
import { EveDataProvider } from '../EveDataProvider';

const meta: Meta<typeof HullListing> = {
  component: HullListing,
  tags: ['autodocs'],
  title: 'Component/HullListing',
};

export default meta;
type Story = StoryObj<typeof HullListing>;

const withEsiProvider: Decorator<{ changeHull: (typeId: number) => void }> = (Story) => {
  return (
    <EveDataProvider>
      <EsiProvider>
        <div style={{height: "400px"}}>
          <Story />
        </div>
      </EsiProvider>
    </EveDataProvider>
  );
}

export const Default: Story = {
  args: {
    changeHull: (typeId: number) => console.log(`changeHull(${typeId})`),
  },
  decorators: [withEsiProvider],
};
