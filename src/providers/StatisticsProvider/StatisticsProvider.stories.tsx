import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";

import { CurrentFitProvider, EsfFit, useCurrentFit } from "../CurrentFitProvider";
import { EveDataProvider } from "../EveDataProvider";
import { DogmaEngineProvider } from "../DogmaEngineProvider";
import { DefaultCharactersProvider, EsiCharactersProvider } from "../Characters";
import { CurrentCharacterProvider } from "../CurrentCharacterProvider";

import { StatisticsProvider, useStatistics } from "./";

type StoryProps = React.ComponentProps<typeof StatisticsProvider> & { fit: EsfFit | null };

const meta: Meta<StoryProps> = {
  component: StatisticsProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<StoryProps>;

const TestStory = ({ fit }: { fit: EsfFit | null }) => {
  const currentFit = useCurrentFit();
  const statistics = useStatistics();

  if (fit != currentFit.fit) {
    currentFit.setFit(fit);
  }

  if (currentFit.fit === null) {
    return <div>No fit selected</div>;
  }
  if (statistics === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>Hull: {statistics.hull.type_id}</div>
      <div>Items: {statistics.items.map((item) => item.type_id).join(", ")}</div>
      <div>
        Slots:{" "}
        {Object.entries(statistics.slots).map(([slot, value]) => {
          return (
            <div key={slot}>
              - {slot}: {value}
            </div>
          );
        })}
      </div>
    </div>
  );
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
    (Story) => (
      <EveDataProvider>
        <DogmaEngineProvider>
          <CurrentFitProvider>
            <DefaultCharactersProvider>
              <EsiCharactersProvider>
                <CurrentCharacterProvider>
                  <Story />
                </CurrentCharacterProvider>
              </EsiCharactersProvider>
            </DefaultCharactersProvider>
          </CurrentFitProvider>
        </DogmaEngineProvider>
      </EveDataProvider>
    ),
  ],
  render: ({ fit, ...args }) => (
    <StatisticsProvider {...args}>
      <TestStory fit={fit} />
    </StatisticsProvider>
  ),
};
