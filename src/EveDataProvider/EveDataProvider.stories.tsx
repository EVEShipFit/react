import type { Meta, StoryObj } from '@storybook/react';
import React from "react";

import { EveDataContext, EveDataProvider } from './';

const meta: Meta<typeof EveDataProvider> = {
  component: EveDataProvider,
  tags: ['autodocs'],
  title: 'Provider/EveDataProvider',
};

export default meta;
type Story = StoryObj<typeof EveDataProvider>;

const TestEveData = () => {
  const eveData = React.useContext(EveDataContext);

  return (
    <div>
      TypeIDs: {eveData.typeIDs ? Object.keys(eveData.typeIDs).length : "loading"}<br/>
      GroupIDs: {eveData.groupIDs ? Object.keys(eveData.groupIDs).length : "loading"}<br/>
      MarketGroups: {eveData.marketGroups ? Object.keys(eveData.marketGroups).length : "loading"}<br/>
      TypeDogma: {eveData.typeDogma ? Object.keys(eveData.typeDogma).length : "loading"}<br/>
      DogmaEffects: {eveData.dogmaEffects ? Object.keys(eveData.dogmaEffects).length : "loading"}<br/>
      DogmaAttributes: {eveData.dogmaAttributes ? Object.keys(eveData.dogmaAttributes).length : "loading"}<br/>
      AttributeMapper: {eveData.attributeMapping ? Object.keys(eveData.attributeMapping).length : "loading"}<br/>
      <br/>
      All loaded: {eveData.loaded ? "yes" : "no"}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <EveDataProvider>
      <TestEveData />
    </EveDataProvider>
  ),
};
