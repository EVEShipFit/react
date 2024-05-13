import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../../.storybook/fits";

import { EveDataProvider } from "../../providers/EveDataProvider";
import { FormatAsEft } from "./FormatAsEft";
import { ShipSnapshotProvider } from "../../providers/ShipSnapshotProvider";
import { DogmaEngineProvider } from "../../providers/DogmaEngineProvider";

const meta: Meta<typeof FormatAsEft> = {
  component: FormatAsEft,
  tags: ["autodocs"],
  title: "Function/FormatAsEft",
};

const withEveDataProvider: Decorator<Record<string, never>> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...context.parameters.snapshot}>
          <Story />
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
};

export default meta;
type Story = StoryObj<typeof FormatAsEft>;

export const Default: Story = {
  decorators: [withEveDataProvider],
  parameters: {
    snapshot: {
      initialFit: fullFit,
    },
  },
};
