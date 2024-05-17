import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { eftFits } from "../../../.storybook/fits";

import { EveDataProvider } from "@/providers/EveDataProvider";

import { ImportEft } from "./ImportEft";

const meta: Meta<typeof ImportEft> = {
  component: ImportEft,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportEft>;

export const Default: Story = {
  argTypes: {
    eft: {
      control: "select",
      options: Object.keys(eftFits),
      mapping: eftFits,
    },
  },
  decorators: [
    (Story) => (
      <EveDataProvider>
        <Story />
      </EveDataProvider>
    ),
  ],
  render: (args) => <ImportEft {...args} />,
};
