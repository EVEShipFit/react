import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../.storybook/fits";

import { TreeHeader, TreeListing } from "./";

const meta: Meta<typeof TreeListing> = {
  component: TreeListing,
  tags: ["autodocs"],
  title: "Component/TreeListing",
};

export default meta;
type Story = StoryObj<typeof TreeListing>;

export const Default: Story = {
  args: {
    getChildren: () => <div>Test</div>,
    header: <TreeHeader text="Header" />,
    level: 0,
  },
  parameters: {
    snapshot: {
      fit: fullFit,
      skills: {},
    },
  },
};
