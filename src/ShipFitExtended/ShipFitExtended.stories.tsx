import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../.storybook/fits";

import { DogmaEngineProvider } from "../DogmaEngineProvider";
import { EsiProvider } from "../EsiProvider";
import { EveDataProvider } from "../EveDataProvider";
import { ShipSnapshotProvider } from "../ShipSnapshotProvider";
import { ShipFitExtended } from "./";

const meta: Meta<typeof ShipFitExtended> = {
  component: ShipFitExtended,
  tags: ["autodocs"],
  title: "Component/ShipFitExtended",
};

export default meta;
type Story = StoryObj<typeof ShipFitExtended>;

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
