import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../../.storybook/fits";

import { DogmaEngineProvider } from "@/providers/DogmaEngineProvider";
import { EveDataProvider } from "@/providers/EveDataProvider";
import { LocalFitProvider } from "@/providers/LocalFitProvider";
import { ShipSnapshotProvider } from "@/providers/ShipSnapshotProvider";
import { ModalDialogAnchor } from "@/components/ModalDialog/ModalDialog";

import { FitButtonBar } from "./";

const meta: Meta<typeof FitButtonBar> = {
  component: FitButtonBar,
  tags: ["autodocs"],
  title: "Component/FitButtonBar",
};

export default meta;
type Story = StoryObj<typeof FitButtonBar>;

const withEveDataProvider: Decorator<Record<string, never>> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <LocalFitProvider>
          <ShipSnapshotProvider {...context.parameters.snapshot}>
            <div style={{ marginTop: "100px" }}>
              <ModalDialogAnchor />
              <Story />
            </div>
          </ShipSnapshotProvider>
        </LocalFitProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
};

export const Default: Story = {
  decorators: [withEveDataProvider],
  parameters: {
    snapshot: {
      initialFit: fullFit,
    },
  },
};
