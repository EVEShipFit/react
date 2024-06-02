import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";
import { useFitSelection, withDecoratorFull } from "../../../.storybook/helpers";

import { EsfFit } from "@/providers/CurrentFitProvider";

import { CargoBay } from "./";

type StoryProps = React.ComponentProps<typeof CargoBay> & { fit: EsfFit | null; width: number };

const meta: Meta<StoryProps> = {
  component: CargoBay,
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
    width: 730,
  },
  decorators: [withDecoratorFull],
  render: ({ fit, width, ...args }) => {
    useFitSelection(fit);

    return (
      <div style={{ width: width, height: width }}>
        <CargoBay {...args} />
      </div>
    );
  },
};
