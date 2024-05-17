import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { TreeHeader, TreeListing } from "./";

const meta: Meta<typeof TreeListing> = {
  component: TreeListing,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TreeListing>;

export const Default: Story = {
  args: {
    getChildren: () => <div>Test</div>,
    header: <TreeHeader text="Header" />,
    level: 0,
  },
};
