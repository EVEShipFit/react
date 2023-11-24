import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { fullFit } from '../../.storybook/fits';

import { EveDataProvider  } from '../EveDataProvider';
import { DogmaEngineProvider } from '../DogmaEngineProvider';
import { ShipSnapshotProvider } from '../ShipSnapshotProvider';
import { EveShipFitLink } from './EveShipFitLink';

const meta: Meta<typeof EveShipFitLink> = {
  component: EveShipFitLink,
  tags: ['autodocs'],
  title: 'Function/EveShipFitLink',
};

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


export default meta;
type Story = StoryObj<typeof EveShipFitLink>;

export const Default: Story = {
  args: {
  },
  decorators: [withShipSnapshotProvider],
  parameters: {
    snapshot: {
      fit: fullFit,
      skills: {},
    }
  },
};
