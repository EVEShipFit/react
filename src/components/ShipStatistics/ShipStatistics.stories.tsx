import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../../.storybook/fits";

import { DogmaEngineProvider } from "@/providers/DogmaEngineProvider";
import { EsiProvider } from "@/providers/EsiProvider";
import { EveDataProvider } from "@/providers/EveDataProvider";
import { ShipSnapshotProvider } from "@/providers/ShipSnapshotProvider";
import { ShipStatistics } from "./";

const meta: Meta<typeof ShipStatistics> = {
  component: ShipStatistics,
  tags: ["autodocs"],
  title: "Component/ShipStatistics",
};

export default meta;
type Story = StoryObj<typeof ShipStatistics>;

const useShipSnapshotProvider: Decorator<Record<string, never>> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...context.parameters.snapshot}>
          <EsiProvider>
            <Story />
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
