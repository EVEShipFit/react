import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/preview-api";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";

import { CurrentFitProvider, EsfFit, useCurrentFit } from "./";

const meta: Meta<typeof CurrentFitProvider> = {
  component: CurrentFitProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CurrentFitProvider>;

const TestStory = ({ fit }: { fit: EsfFit | null }) => {
  const currentFit = useCurrentFit();

  /* Normally the initialFit argument has no impact after first render.
   * But for the storybook this looks silly, so we change the fit like
   * it was the first render. */
  React.useEffect(() => {
    currentFit.setFit(fit ?? null);
  });

  return <pre>{JSON.stringify(currentFit.currentFit, null, 2)}</pre>;
};

export const Default: Story = {
  argTypes: {
    children: { control: false },
    initialFit: fitArgType,
  },
  args: {
    initialFit: null,
  },
  render: (args) => {
    const [{ initialFit }] = useArgs();

    return (
      <CurrentFitProvider {...args}>
        <TestStory fit={initialFit} />
      </CurrentFitProvider>
    );
  },
};
