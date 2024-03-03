import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { DogmaEngineProvider } from "../DogmaEngineProvider";
import { EsiProvider } from "../EsiProvider";
import { EveDataProvider } from "../EveDataProvider";
import { fullFit } from "../../.storybook/fits";
import { ShipSnapshotProvider } from "../ShipSnapshotProvider";

import { HardwareListing } from "./";

const meta: Meta<typeof HardwareListing> = {
  component: HardwareListing,
  tags: ["autodocs"],
  title: "Component/HardwareListing",
};

export default meta;
type Story = StoryObj<typeof HardwareListing>;

const useShipSnapshotProvider: Decorator<Record<string, never>> = (Story, context) => {
  const [skills, setSkills] = React.useState<Record<string, number>>({});

  return (
    <EveDataProvider>
      <EsiProvider setSkills={setSkills}>
        <DogmaEngineProvider>
          <ShipSnapshotProvider {...context.parameters.snapshot} skills={skills}>
            <div style={{ width: context.args.width, height: context.args.width }}>
              <Story />
            </div>
          </ShipSnapshotProvider>
        </DogmaEngineProvider>
      </EsiProvider>
    </EveDataProvider>
  );
};

export const Default: Story = {
  decorators: [useShipSnapshotProvider],
  parameters: {
    snapshot: {
      fit: fullFit,
    },
  },
};
