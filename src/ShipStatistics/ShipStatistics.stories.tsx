import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { fullFit } from '../../.storybook/fits';

import { DogmaEngineProvider } from '../DogmaEngineProvider';
import { EveDataProvider  } from '../EveDataProvider';
import { ShipSnapshotProvider } from '../ShipSnapshotProvider';
import { ShipStatistics } from './';

const meta: Meta<typeof ShipStatistics> = {
  component: ShipStatistics,
  tags: ['autodocs'],
  title: 'Component/ShipStatistics',
};

export default meta;
type Story = StoryObj<typeof ShipStatistics>;

const withShipSnapshotProvider: Decorator<Record<string, never>> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...context.parameters.snapshot}>
          <Story />
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
}

export const Default: Story = {
  decorators: [withShipSnapshotProvider],
  parameters: {
    snapshot: {
      fit: fullFit,
      skills: {},
    }
  },
};
