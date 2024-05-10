import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../.storybook/fits";

import { EveDataContext, EveDataProvider } from "../EveDataProvider";
import { DogmaEngineProvider } from "../DogmaEngineProvider";
import { ShipSnapshotItemAttribute, ShipSnapshotContext, ShipSnapshotProvider } from "./";

const meta: Meta<typeof ShipSnapshotProvider> = {
  component: ShipSnapshotProvider,
  tags: ["autodocs"],
  title: "Provider/ShipSnapshotProvider",
};

export default meta;
type Story = StoryObj<typeof ShipSnapshotProvider>;

const TestShipSnapshot = () => {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  if (shipSnapshot?.loaded) {
    return (
      <div>
        ShipSnapshot: loaded
        <br />
        Hull:
        <ul>
          {Array.from(shipSnapshot.hull?.attributes.entries() || []).map(
            ([id, attribute]: [number, ShipSnapshotItemAttribute]) => (
              <li key={id}>
                {eveData?.dogmaAttributes?.[id].name} ({id}): {attribute.value}
              </li>
            ),
          )}
        </ul>
      </div>
    );
  }

  return (
    <div>
      ShipSnapshot: loading
      <br />
    </div>
  );
};

export const Default: Story = {
  args: {
    initialFit: fullFit,
  },
  render: (args) => (
    <EveDataProvider>
      <DogmaEngineProvider>
        <ShipSnapshotProvider {...args}>
          <TestShipSnapshot />
        </ShipSnapshotProvider>
      </DogmaEngineProvider>
    </EveDataProvider>
  ),
};
