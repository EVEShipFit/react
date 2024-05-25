import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";
import { useFitSelection, withDecoratorFull } from "../../../.storybook/helpers";

import { EsfFit, useCurrentFit } from "@/providers/CurrentFitProvider";

import { FitHistory } from "./";

type StoryProps = React.ComponentProps<typeof FitHistory> & { fit: EsfFit | null; width: number };

const meta: Meta<StoryProps> = {
  component: FitHistory,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<StoryProps>;

const TestStory = () => {
  const currentFit = useCurrentFit();

  return <div>Current Fit: {currentFit.fit?.name}</div>;
};

export const Default: Story = {
  argTypes: {
    fit: fitArgType,
  },
  args: {
    fit: null,
    historySize: 10,
  },
  decorators: [withDecoratorFull],
  render: ({ fit, ...args }) => {
    useFitSelection(fit);

    return (
      <div>
        <TestStory />
        <FitHistory {...args} />
      </div>
    );
  },
};
