import React from "react";

import { EveData, useEveData } from "@/providers/EveDataProvider";
import { State, useCurrentFit } from "@/providers/CurrentFitProvider";
import { useCurrentCharacter } from "@/providers/CurrentCharacterProvider";
import { useDogmaEngine } from "@/providers/DogmaEngineProvider";

export interface StatisticsItemAttributeEffect {
  operator: string;
  penalty: boolean;
  source: "Ship" | "Char" | "Structure" | "Target" | { Item?: number; Charge?: number; Skill?: number };
  source_category: string;
  source_attribute_id: number;
}

export interface StatisticsItemAttribute {
  base_value: number;
  value: number;
  effects: StatisticsItemAttributeEffect[];
}

export interface StatisticsItem {
  type_id: number;
  quantity: number;
  flag: number;
  charge: StatisticsItem | undefined;
  state: State;
  max_state: State;
  attributes: Map<number, StatisticsItemAttribute>;
  effects: number[];
}

const StatisticsSlotEntries = ["hislot", "medslot", "lowslot", "subsystem", "rig", "launcher", "turret"] as const;
export type StatisticsSlotType = (typeof StatisticsSlotEntries)[number];

type StatisticsSlots = {
  [key in StatisticsSlotType]: number;
};

interface Statistics {
  hull: StatisticsItem;
  items: StatisticsItem[];
  skills: StatisticsItem[];
  char: StatisticsItem;
  structure: StatisticsItem;
  target: StatisticsItem;
  slots: StatisticsSlots;
}

const SlotAttributeMapping: Record<StatisticsSlotType, [string, string | null]> = {
  hislot: ["hiSlots", "hiSlotModifier"],
  medslot: ["medSlots", "medSlotModifier"],
  lowslot: ["lowSlots", "lowSlotModifier"],
  subsystem: ["maxSubSystems", null],
  rig: ["rigSlots", null],
  launcher: ["launcherSlotsLeft", "launcherHardPointModifier"],
  turret: ["turretSlotsLeft", "turretHardPointModifier"],
};

const StatisticsContext = React.createContext<Statistics | null>(null);

export const useStatistics = () => {
  return React.useContext(StatisticsContext);
};

interface StatisticsProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

const CalculateSlots = (eveData: EveData, statistics: Statistics) => {
  /* Set all slots to zero. */
  statistics.slots = StatisticsSlotEntries.reduce((acc, slot) => {
    acc[slot] = 0;
    return acc;
  }, {} as StatisticsSlots);

  /* Find the statistics of the hull. */
  for (const slot of StatisticsSlotEntries) {
    const attributeId = SlotAttributeMapping[slot][0];

    const attribute = statistics.hull.attributes.get(eveData.attributeMapping[attributeId]);
    const value = attribute?.value ?? 0;

    statistics.slots[slot] += value;
  }
  /* Check if any items modify this value. */
  for (const item of statistics.items) {
    for (const slot of StatisticsSlotEntries) {
      const attributeId = SlotAttributeMapping[slot][1];
      if (attributeId === null) continue;

      const attribute = item.attributes.get(eveData.attributeMapping[attributeId]);
      const value = attribute?.value ?? 0;

      statistics.slots[slot] += value;
    }
  }
};

/**
 * Calculates and keeps the statistics of the current fit.
 *
 * This provider depends on `EveDataProvider`, `CurrentFitProvider`, `CurrentCharacterProvider`, and `DogmaEngineProvider`.
 *
 * Use the `useStatistics` hook to access the statistics.
 */
export const StatisticsProvider = (props: StatisticsProps) => {
  const eveData = useEveData();
  const currentFit = useCurrentFit();
  const currentCharacter = useCurrentCharacter();
  const dogmaEngine = useDogmaEngine();

  const contextValue = React.useMemo(() => {
    const fit = currentFit.fit;
    const skills = currentCharacter.character?.skills;

    if (fit === null || skills === undefined || dogmaEngine === null || eveData === null) {
      return null;
    }

    const statistics: Statistics = dogmaEngine.calculate(fit, skills);

    CalculateSlots(eveData, statistics);

    return statistics;
  }, [eveData, dogmaEngine, currentFit.fit, currentCharacter.character?.skills]);

  return <StatisticsContext.Provider value={contextValue}>{props.children}</StatisticsContext.Provider>;
};
