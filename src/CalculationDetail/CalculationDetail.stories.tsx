import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFits } from "../../.storybook/fits";

import { DogmaEngineProvider } from "../DogmaEngineProvider";
import { EsiProvider } from "../EsiProvider";
import { EveDataProvider } from "../EveDataProvider";
import { ShipSnapshotProvider } from "../ShipSnapshotProvider";
import { CalculationDetail } from "./";

const meta: Meta<typeof CalculationDetail> = {
  component: CalculationDetail,
  tags: ["autodocs"],
  title: "Component/CalculationDetail",
};

export default meta;
type Story = StoryObj<typeof CalculationDetail>;

const useShipSnapshotProvider: Decorator<{
  source: "Ship" | "Char" | "Structure" | "Target" | { Item?: number; Cargo?: number };
}> = (Story, context) => {
  const [skills, setSkills] = React.useState<Record<string, number>>({});

  return (
    <EveDataProvider>
      <EsiProvider setSkills={setSkills}>
        <DogmaEngineProvider>
          <ShipSnapshotProvider {...context.parameters.snapshot} skills={skills}>
            <Story {...context.args} />
          </ShipSnapshotProvider>
        </DogmaEngineProvider>
      </EsiProvider>
    </EveDataProvider>
  );
};

export const Default: Story = {
  args: {
    source: "Ship",
  },
  decorators: [useShipSnapshotProvider],
  parameters: {
    snapshot: {
      fit: fullFits[1],
    },
  },
};
