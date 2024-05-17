import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";
import { useFitSelection, withDecoratorFull } from "../../../.storybook/helpers";

import { EsfFit } from "@/providers/CurrentFitProvider";

import { CalculationDetail } from "./";

type StoryProps = React.ComponentProps<typeof CalculationDetail> & { fit: EsfFit | null };

const meta: Meta<StoryProps> = {
  component: CalculationDetail,
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
    source: "Ship",
  },
  decorators: [withDecoratorFull],
  render: ({ fit, ...args }) => {
    useFitSelection(fit);

    return <CalculationDetail {...args} />;
  },
};
