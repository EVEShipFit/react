import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { EveDataProvider, useEveData } from "./";

const meta: Meta<typeof EveDataProvider> = {
  component: EveDataProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EveDataProvider>;

const TestEveData = () => {
  const eveData = useEveData();

  if (eveData === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      TypeIDs: {Object.keys(eveData.typeIDs).length}
      <br />
      GroupIDs: {Object.keys(eveData.groupIDs).length}
      <br />
      MarketGroups: {Object.keys(eveData.marketGroups).length}
      <br />
      TypeDogma: {Object.keys(eveData.typeDogma).length}
      <br />
      DogmaEffects: {Object.keys(eveData.dogmaEffects).length}
      <br />
      DogmaAttributes: {Object.keys(eveData.dogmaAttributes).length}
      <br />
      AttributeMapper: {Object.keys(eveData.attributeMapping).length}
    </div>
  );
};

export const Default: Story = {
  argTypes: {
    children: { control: false },
    dataUrl: { control: false },
  },
  render: (args) => (
    <EveDataProvider {...args}>
      <TestEveData />
    </EveDataProvider>
  ),
};
