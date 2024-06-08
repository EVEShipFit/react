import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { esfEncodedFits } from "../../../.storybook/fits";

import { EveDataProvider } from "@/providers/EveDataProvider";

import { ImportEveShipFit } from "./ImportEveShipFit";

const meta: Meta<typeof ImportEveShipFit> = {
  component: ImportEveShipFit,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportEveShipFit>;

export const Default: Story = {
  argTypes: {
    esfEncoded: {
      control: "select",
      options: Object.keys(esfEncodedFits),
      mapping: esfEncodedFits,
    },
  },
  decorators: [
    (Story) => (
      <EveDataProvider>
        <Story />
      </EveDataProvider>
    ),
  ],
  render: (args) => <ImportEveShipFit {...args} />,
};
