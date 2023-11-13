import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { fullFit } from '../../.storybook/fits';

import { DogmaEngineProvider } from '../DogmaEngineProvider';
import { EveDataProvider  } from '../EveDataProvider';
import { ShipSnapshotProvider } from '../ShipSnapshotProvider';
import { ShipFit } from './';

const meta: Meta<typeof ShipFit> = {
  component: ShipFit,
  tags: ['autodocs'],
  title: 'Component/ShipFit',
};

export default meta;
type Story = StoryObj<typeof ShipFit>;

const withShipSnapshotProvider: Decorator<{ radius?: number }> = (Story, context) => {
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
    radius: 365,
  },
  decorators: [withShipSnapshotProvider],
  parameters: {
    snapshot: {
      fit: fullFit,
      skills: {},
    }
  },
};
