import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { fullFit } from '../../.storybook/fits';

import { DogmaEngineProvider } from '../DogmaEngineProvider';
import { EveDataProvider  } from '../EveDataProvider';
import { ShipSnapshotProvider } from '../ShipSnapshotProvider';
import { ShipFitExtended } from './';

const meta: Meta<typeof ShipFitExtended> = {
  component: ShipFitExtended,
  tags: ['autodocs'],
  title: 'Component/ShipFitExtended',
};

export default meta;
type Story = StoryObj<typeof ShipFitExtended>;

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
