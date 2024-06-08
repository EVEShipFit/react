import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";
import { useFitSelection, withDecoratorFull } from "../../../.storybook/helpers";

import { EsfFit } from "@/providers/CurrentFitProvider";

import { ExportEveShipFit } from "./ExportEveShipFit";

type StoryProps = React.ComponentProps<typeof ExportEveShipFit> & { fit: EsfFit | null };

const meta: Meta<StoryProps> = {
  component: ExportEveShipFit,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<StoryProps>;

export const Default: Story = {
  argTypes: {
    fit: fitArgType,
  },
  args: {
    fit: null,
  },
  decorators: [withDecoratorFull],
  render: ({ fit, ...args }) => {
    useFitSelection(fit);

    return <ExportEveShipFit {...args} />;
  },
};
