import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { esiFits } from "../../../.storybook/fits";

import { EveDataProvider } from "@/providers/EveDataProvider";

import { ImportEsiFitting } from "./ImportEsiFitting";

const meta: Meta<typeof ImportEsiFitting> = {
  component: ImportEsiFitting,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportEsiFitting>;

export const Default: Story = {
  argTypes: {
    esiFit: {
      control: "select",
      options: Object.keys(esiFits),
      mapping: esiFits,
    },
  },
  decorators: [
    (Story) => (
      <EveDataProvider>
        <Story />
      </EveDataProvider>
    ),
  ],
  render: (args) => <ImportEsiFitting {...args} />,
};
