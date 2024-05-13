import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../../.storybook/fits";

import { DogmaEngineProvider } from "../../providers/DogmaEngineProvider";
import { EveDataProvider } from "../../providers/EveDataProvider";
import { ShipSnapshotProvider } from "../../providers/ShipSnapshotProvider";
import { ShipFit } from "./";

const meta: Meta<typeof ShipFit> = {
  component: ShipFit,
  tags: ["autodocs"],
  title: "Component/ShipFit",
};

export default meta;
type Story = StoryObj<typeof ShipFit>;

const withShipSnapshotProvider: Decorator<Record<string, never>> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...context.parameters.snapshot}>
          <div style={{ width: context.args.width, height: context.args.width }}>
            <Story />
          </div>
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
};

export const Default: Story = {
  args: {
    width: 730,
  },
  decorators: [withShipSnapshotProvider],
  parameters: {
    snapshot: {
      initialFit: fullFit,
    },
  },
};
