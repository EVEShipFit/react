import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { hashFit } from '../../.storybook/fits';

import { EveDataProvider  } from '../EveDataProvider';
import { EveShipFitHash } from './EveShipFitHash';

const meta: Meta<typeof EveShipFitHash> = {
  component: EveShipFitHash,
  tags: ['autodocs'],
  title: 'Function/EveShipFitHash',
};

const withEveDataProvider: Decorator<{fitHash: string}> = (Story) => {
  return (
    <EveDataProvider>
      <Story />
    </EveDataProvider>
  );
}


export default meta;
type Story = StoryObj<typeof EveShipFitHash>;

export const Default: Story = {
  args: {
    "fitHash": hashFit,
  },
  decorators: [withEveDataProvider],
};
