import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../../.storybook/fits";

import { DogmaEngineProvider } from "@/providers/DogmaEngineProvider";
import { EsiProvider } from "@/providers/EsiProvider";
import { EveDataProvider } from "@/providers/EveDataProvider";
import { ShipSnapshotProvider } from "@/providers/ShipSnapshotProvider";
import { DroneBay } from "./";

const meta: Meta<typeof DroneBay> = {
  component: DroneBay,
  tags: ["autodocs"],
  title: "Component/DroneBay",
};

export default meta;
type Story = StoryObj<typeof DroneBay>;

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
  args: {
    width: 730,
  },
  decorators: [useShipSnapshotProvider],
  parameters: {
    snapshot: {
      initialFit: fullFit,
    },
  },
};
