import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { hashFits } from "../../../.storybook/fits";

import { EveDataProvider } from "@/providers/EveDataProvider";

import { ImportEveShipFitHash } from "./ImportEveShipFitHash";

const meta: Meta<typeof ImportEveShipFitHash> = {
  component: ImportEveShipFitHash,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportEveShipFitHash>;

export const Default: Story = {
  argTypes: {
    fitHash: {
      control: "select",
      options: Object.keys(hashFits),
      mapping: hashFits,
    },
  },
  decorators: [
    (Story) => (
      <EveDataProvider>
        <Story />
      </EveDataProvider>
    ),
  ],
  render: (args) => <ImportEveShipFitHash {...args} />,
};
