import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { fullFit } from '../../.storybook/fits';

import { DogmaEngineProvider } from '../DogmaEngineProvider';
import { EveDataProvider  } from '../EveDataProvider';
import { ShipSnapshotProvider } from '../ShipSnapshotProvider';
import { CalculationDetail } from './';

const meta: Meta<typeof CalculationDetail> = {
  component: CalculationDetail,
  tags: ['autodocs'],
  title: 'Component/CalculationDetail',
};

export default meta;
type Story = StoryObj<typeof CalculationDetail>;

const withShipSnapshotProvider: Decorator<{source: "Ship" | { Item: number }}> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...context.parameters.snapshot}>
          <Story {...context.args} />
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
}

export const Default: Story = {
  args: {
    source: "Ship",
  },
  decorators: [withShipSnapshotProvider],
  parameters: {
    snapshot: {
      fit: fullFit,
      skills: {},
    }
  },
};
