import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { fullFit } from '../../.storybook/fits';

import { DogmaEngineProvider } from '../DogmaEngineProvider';
import { EveDataProvider } from '../EveDataProvider';
import { LocalFitProvider } from '../LocalFitProvider';
import { ModalDialogAnchor } from '../ModalDialog/ModalDialog';
import { ShipSnapshotProvider } from '../ShipSnapshotProvider';

import { FitButtonBar } from './';

const meta: Meta<typeof FitButtonBar> = {
  component: FitButtonBar,
  tags: ['autodocs'],
  title: 'Component/FitButtonBar',
};

export default meta;
type Story = StoryObj<typeof FitButtonBar>;

const withEveDataProvider: Decorator<Record<string, never>> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <LocalFitProvider>
          <ShipSnapshotProvider {...context.parameters.snapshot}>
            <div style={{marginTop: "50px"}}>
              <ModalDialogAnchor />
              <Story />
            </div>
          </ShipSnapshotProvider>
        </LocalFitProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
}

export const Default: Story = {
  decorators: [withEveDataProvider],
  parameters: {
    snapshot: {
      fit: fullFit,
      skills: {},
    }
  },
};
