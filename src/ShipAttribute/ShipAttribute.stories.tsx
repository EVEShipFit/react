import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { DogmaEngineProvider } from '../DogmaEngineProvider';
import { EveDataProvider  } from '../EveDataProvider';
import { ShipSnapshotProvider } from '../ShipSnapshotProvider';
import { ShipAttribute } from './';

const meta: Meta<typeof ShipAttribute> = {
  component: ShipAttribute,
  tags: ['autodocs'],
  title: 'Component/ShipAttribute',
};

export default meta;
type Story = StoryObj<typeof ShipAttribute>;

const withShipSnapshotProvider: Decorator<{name: string}> = (Story, context) => {
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
  args: {
    name: "cpuUsage",
  },
  decorators: [withShipSnapshotProvider],
  parameters: {
    snapshot: {
      fit: JSON.parse("{\"name\": \"test\", \"ship_type_id\": 12747, \"items\": [{\"flag\": 11, \"quantity\": 1, \"type_id\": 20639}]}"),
      skills: {},
    }
  },
};
