import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../../.storybook/fits";

import { HullListing } from "./";
import { DogmaEngineProvider } from "@/providers/DogmaEngineProvider";
import { EsiProvider } from "@/providers/EsiProvider";
import { EveDataProvider } from "@/providers/EveDataProvider";
import { LocalFitProvider } from "@/providers/LocalFitProvider";
import { ShipSnapshotProvider } from "@/providers/ShipSnapshotProvider";

const meta: Meta<typeof HullListing> = {
  component: HullListing,
  tags: ["autodocs"],
  title: "Component/HullListing",
};

export default meta;
type Story = StoryObj<typeof HullListing>;

const withEsiProvider: Decorator<Record<string, never>> = (Story, context) => {
  return (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...context.parameters.snapshot}>
          <LocalFitProvider>
            <EsiProvider>
              <div style={{ height: "400px" }}>
                <Story />
              </div>
            </EsiProvider>
          </LocalFitProvider>
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  );
};

export const Default: Story = {
  args: {},
  decorators: [withEsiProvider],
  parameters: {
    snapshot: {
      initialFit: fullFit,
    },
  },
};
