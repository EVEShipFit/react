import type { Decorator, Meta, StoryObj } from "@storybook/react";
import React from "react";

import { eftFit } from "../../.storybook/fits";

import { EveDataProvider } from "../EveDataProvider";
import { FormatEftToEsi } from "./FormatEftToEsi";

const meta: Meta<typeof FormatEftToEsi> = {
  component: FormatEftToEsi,
  tags: ["autodocs"],
  title: "Function/FormatEftToEsi",
};

const withEveDataProvider: Decorator<{ eft: string }> = (Story) => {
  return (
    <EveDataProvider>
      <Story />
    </EveDataProvider>
  );
};

export default meta;
type Story = StoryObj<typeof FormatEftToEsi>;

export const Default: Story = {
  args: {
    eft: eftFit,
  },
  decorators: [withEveDataProvider],
};
