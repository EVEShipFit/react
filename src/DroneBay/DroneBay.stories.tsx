import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../.storybook/fits";

import { DogmaEngineProvider } from "../DogmaEngineProvider";
import { EsiProvider } from "../EsiProvider";
import { EveDataProvider } from "../EveDataProvider";
import { ShipSnapshotProvider } from "../ShipSnapshotProvider";
import { DroneBay } from "./";

const meta: Meta<typeof DroneBay> = {
  component: DroneBay,
  tags: ["autodocs"],
  title: "Component/DroneBay",
};

export default meta;
type Story = StoryObj<typeof DroneBay>;

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
  args: {
    width: 730,
  },
  decorators: [useShipSnapshotProvider],
  parameters: {
    snapshot: {
      fit: fullFit,
    },
  },
};
