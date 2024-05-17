import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";

import { EveDataProvider } from "@/providers/EveDataProvider";
import { EsfFit } from "@/providers/CurrentFitProvider";

import { DogmaEngineProvider, useDogmaEngine } from "./";

type StoryProps = React.ComponentProps<typeof DogmaEngineProvider> & { fit: EsfFit | null };

const meta: Meta<StoryProps> = {
  component: DogmaEngineProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<StoryProps>;

/** Convert an ES6 map to an Object, which JSON can stringify. */
function MapToDict(_key: string, value: unknown) {
  if (value instanceof Map) {
    return Array.from(value.entries()).reduce((obj, [key, item]) => Object.assign(obj, { [key]: item }), {});
  }

  return value;
}

const TestStory = ({ fit }: { fit: EsfFit | null }) => {
  const dogmaEngine = useDogmaEngine();
  if (dogmaEngine === null) {
    return <div>Loading...</div>;
  }
  if (fit === null) {
    return <div>No fit selected</div>;
  }

  return <div>Stats: {JSON.stringify(dogmaEngine.calculate(fit, {}), MapToDict)}</div>;
};

export const Default: Story = {
  argTypes: {
    children: { control: false },
    fit: fitArgType,
  },
  args: {
    fit: null,
  },
  decorators: [
    (Story) => {
      return (
        <EveDataProvider>
          <Story />
        </EveDataProvider>
      );
    },
  ],
  render: ({ fit, ...args }) => (
    <DogmaEngineProvider {...args}>
      <TestStory fit={fit} />
    </DogmaEngineProvider>
  ),
};
