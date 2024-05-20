import React from "react";
import { StoryFn } from "@storybook/react";

import { ModalDialogAnchor } from "@/components/ModalDialog";
import { EveDataProvider } from "@/providers/EveDataProvider";
import { DogmaEngineProvider } from "@/providers/DogmaEngineProvider";
import { CurrentFitProvider, EsfFit, useCurrentFit } from "@/providers/CurrentFitProvider";
import { LocalFitsProvider } from "@/providers/LocalFitsProvider";
import { DefaultCharactersProvider, EsiCharactersProvider } from "@/providers/Characters";
import { CurrentCharacterProvider } from "@/providers/CurrentCharacterProvider";
import { StatisticsProvider } from "@/providers/StatisticsProvider";
import { FitManagerProvider } from "@/providers/FitManagerProvider";

export const withDecoratorFull = (Story: StoryFn) => (
  <EveDataProvider>
    <DogmaEngineProvider>
      <CurrentFitProvider>
        <LocalFitsProvider>
          <DefaultCharactersProvider>
            <EsiCharactersProvider>
              <CurrentCharacterProvider>
                <StatisticsProvider>
                  <FitManagerProvider>
                    <ModalDialogAnchor />
                    <Story />
                  </FitManagerProvider>
                </StatisticsProvider>
              </CurrentCharacterProvider>
            </EsiCharactersProvider>
          </DefaultCharactersProvider>
        </LocalFitsProvider>
      </CurrentFitProvider>
    </DogmaEngineProvider>
  </EveDataProvider>
);

export const useFitSelection = (fit: EsfFit | null) => {
  const currentFit = useCurrentFit();
  const setFit = currentFit.setFit;

  React.useEffect(() => {
    setFit(fit);
  }, [setFit, fit]);
};
