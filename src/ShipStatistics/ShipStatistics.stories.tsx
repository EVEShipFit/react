import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

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
      fit: JSON.parse("{\"name\": \"test\", \"ship_type_id\": 12747, \"items\": [{\"flag\": 11, \"quantity\": 1, \"type_id\": 20639}]}"),
      skills: {},
    }
  },
};
