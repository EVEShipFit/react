import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { DogmaEngineProvider } from "../../providers/DogmaEngineProvider";
import { EsiProvider } from "../../providers/EsiProvider";
import { EveDataProvider } from "../../providers/EveDataProvider";
import { fullFit } from "../../../.storybook/fits";
import { ShipSnapshotProvider } from "../../providers/ShipSnapshotProvider";

import { HardwareListing } from "./";

const meta: Meta<typeof HardwareListing> = {
  component: HardwareListing,
  tags: ["autodocs"],
  title: "Component/HardwareListing",
};

export default meta;
type Story = StoryObj<typeof HardwareListing>;

const useShipSnapshotProvider: Decorator<Record<string, never>> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...context.parameters.snapshot}>
          <EsiProvider>
            <div style={{ width: context.args.width, height: context.args.width }}>
              <Story />
            </div>
          </EsiProvider>
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
};

export const Default: Story = {
  decorators: [useShipSnapshotProvider],
  parameters: {
    snapshot: {
      initialFit: fullFit,
    },
  },
};
