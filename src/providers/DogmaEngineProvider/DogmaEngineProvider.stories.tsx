import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fullFit } from "../../../.storybook/fits";

import { EveDataProvider } from "@/providers/EveDataProvider";
import { DogmaEngineContext, DogmaEngineProvider } from "./";

const meta: Meta<typeof DogmaEngineProvider> = {
  component: DogmaEngineProvider,
  tags: ["autodocs"],
  title: "Provider/DogmaEngineProvider",
};

export default meta;
type Story = StoryObj<typeof DogmaEngineProvider>;

/** Convert an ES6 map to an Object, which JSON can stringify. */
function MapToDict(_key: string, value: unknown) {
  if (value instanceof Map) {
    return Array.from(value.entries()).reduce((obj, [key, item]) => Object.assign(obj, { [key]: item }), {});
  }

  return value;
}

const TestDogmaEngine = () => {
  const dogmaEngine = React.useContext(DogmaEngineContext);

  if (dogmaEngine?.loaded) {
    const stats = dogmaEngine.engine?.calculate(fullFit, {});

    return (
      <div>
        DogmaEngine: loaded
        <br />
        Stats: {JSON.stringify(stats, MapToDict)}
      </div>
    );
  }

  return (
    <div>
      DogmaEngine: loading
      <br />
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <EveDataProvider>
      <DogmaEngineProvider>
        <TestDogmaEngine />
      </DogmaEngineProvider>
    </EveDataProvider>
  ),
};
