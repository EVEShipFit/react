import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { fullFit } from '../../.storybook/fits';

import { HullListing } from './';
import { EsiProvider } from '../EsiProvider';
import { EveDataProvider } from '../EveDataProvider';
import { EsiFit, ShipSnapshotProvider } from '../ShipSnapshotProvider';
import { DogmaEngineProvider } from '../DogmaEngineProvider';

const meta: Meta<typeof HullListing> = {
  component: HullListing,
  tags: ['autodocs'],
  title: 'Component/HullListing',
};

export default meta;
type Story = StoryObj<typeof HullListing>;

const withEsiProvider: Decorator<{ changeHull: (typeId: number) => void, changeFit: (fit: EsiFit) => void }> = (Story, context) => {
  return (
    <EveDataProvider>
      <EsiProvider setSkills={console.log}>
        <DogmaEngineProvider>
          <ShipSnapshotProvider {...context.parameters.snapshot}>
            <div style={{height: "400px"}}>
              <Story />
            </div>
          </ShipSnapshotProvider>
        </DogmaEngineProvider>
      </EsiProvider>
    </EveDataProvider>
  );
}

export const Default: Story = {
  args: {
    changeHull: (typeId: number) => console.log(`changeHull(${typeId})`),
    changeFit: (fit: EsiFit) => console.log(`changeFit(${fit})`),
  },
  decorators: [withEsiProvider],
  parameters: {
    snapshot: {
      fit: fullFit,
      skills: {},
    }
  },
};
