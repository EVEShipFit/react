import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../.storybook/fits";

import { DogmaEngineProvider } from "../DogmaEngineProvider";
import { EveDataProvider } from "../EveDataProvider";
import { ShipSnapshotProvider } from "../ShipSnapshotProvider";
import { ShipAttribute } from "./";

const meta: Meta<typeof ShipAttribute> = {
  component: ShipAttribute,
  tags: ["autodocs"],
  title: "Component/ShipAttribute",
};

export default meta;
type Story = StoryObj<typeof ShipAttribute>;

const withShipSnapshotProvider: Decorator<{ name: string }> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...context.parameters.snapshot}>
          cpuUsage: <Story />
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
};

export const Default: Story = {
  args: {
    name: "cpuUsed",
  },
  decorators: [withShipSnapshotProvider],
  parameters: {
    snapshot: {
      initialFit: fullFit,
    },
  },
};
