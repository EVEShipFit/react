import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { LocalFitsProvider, useLocalFits } from "./";

const meta: Meta<typeof LocalFitsProvider> = {
  component: LocalFitsProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LocalFitsProvider>;

const TestStory = () => {
  const localFits = useLocalFits();

  return (
    <div>
      {Object.values(localFits.fittings).map((fit) => {
        return (
          <div key={fit.name}>
            {fit.name} - {Object.keys(fit.items).length} items
          </div>
        );
      })}
    </div>
  );
};

export const Default: Story = {
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <LocalFitsProvider {...args}>
      <TestStory />
    </LocalFitsProvider>
  ),
};
