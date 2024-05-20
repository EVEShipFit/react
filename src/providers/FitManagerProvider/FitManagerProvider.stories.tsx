import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";
import { useFitSelection, withDecoratorFull } from "../../../.storybook/helpers";

import { EsfFit } from "@/providers/CurrentFitProvider";

import { FitManagerProvider } from "./";

type StoryProps = React.ComponentProps<typeof FitManagerProvider> & { fit: EsfFit | null };

const meta: Meta<StoryProps> = {
  component: FitManagerProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<StoryProps>;

const TestStory = () => {
  return <div></div>;
};

export const Default: Story = {
  argTypes: {
    children: { control: false },
    fit: fitArgType,
  },
  args: {
    fit: null,
  },
  decorators: [withDecoratorFull],
  render: ({ fit, ...args }) => {
    useFitSelection(fit);

    return (
      <FitManagerProvider {...args}>
        <TestStory />
      </FitManagerProvider>
    );
  },
};
