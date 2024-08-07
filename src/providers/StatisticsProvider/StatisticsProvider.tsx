import React from "react";

import { EveData, useEveData } from "@/providers/EveDataProvider";
import { EsfFit, useCurrentFit } from "@/providers/CurrentFitProvider";
import { useCurrentCharacter } from "@/providers/CurrentCharacterProvider";
import { Calculation, useDogmaEngine } from "@/providers/DogmaEngineProvider";

const StatisticsSlotTypeEntries = ["High", "Medium", "Low", "SubSystem", "Rig", "Launcher", "Turret"] as const;
export type StatisticsSlotType = (typeof StatisticsSlotTypeEntries)[number];

export type StatisticsSlots = {
  [key in StatisticsSlotType]: number;
};

const SlotAttributeMapping: Record<StatisticsSlotType, [string, string | null]> = {
  High: ["hiSlots", "hiSlotModifier"],
  Medium: ["medSlots", "medSlotModifier"],
  Low: ["lowSlots", "lowSlotModifier"],
  SubSystem: ["maxSubSystems", null],
  Rig: ["rigSlots", null],
  Launcher: ["launcherSlotsLeft", "launcherHardPointModifier"],
  Turret: ["turretSlotsLeft", "turretHardPointModifier"],
};

interface Statistics extends Calculation {
  slots: StatisticsSlots;
  capacityUsed: number;
}

const StatisticsContext = React.createContext<{ statistics: Statistics | null; current: Statistics | null } | null>(
  null,
);

export const useStatistics = () => {
  const statistics = React.useContext(StatisticsContext);
  return statistics === null ? null : statistics.statistics;
};

export const useCurrentStatistics = () => {
  const statistics = React.useContext(StatisticsContext);
  return statistics === null ? null : (statistics.current ?? statistics.statistics);
};

interface StatisticsProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

const CalculateSlots = (eveData: EveData, statistics: Statistics) => {
  /* Find the statistics of the hull. */
  for (const slot of StatisticsSlotTypeEntries) {
    const attributeId = SlotAttributeMapping[slot][0];

    const attribute = statistics.hull.attributes.get(eveData.attributeMapping[attributeId]);
    const value = attribute?.value ?? 0;

    statistics.slots[slot] += value;
  }

  /* Check if any items modify this value. */
  for (const item of statistics.items) {
    for (const slot of StatisticsSlotTypeEntries) {
      const attributeId = SlotAttributeMapping[slot][1];
      if (attributeId === null) continue;

      const attribute = item.attributes.get(eveData.attributeMapping[attributeId]);
      const value = attribute?.value ?? 0;

      statistics.slots[slot] += value;
    }
  }

  /* EVE Online changed from 5 subsystems to 4, but the attributes aren't changed to match this. */
  if (statistics.slots.SubSystem === 5) statistics.slots.SubSystem = 4;
};

const CalculateCargoBay = (eveData: EveData, fit: EsfFit): number => {
  /* Calculate the volume of all cargo. */
  const cargoVolume = fit.cargo.reduce((acc, cargo) => {
    const type = eveData.types[cargo.typeId];
    if (type === undefined) return acc;

    return acc + (type.volume ?? 0) * cargo.quantity;
  }, 0);

  return cargoVolume;
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

  const [lastStatistics, setLastStatistics] = React.useState<Statistics | null>(null);
  const lastStatisticsRef = React.useRef<Statistics | null>(lastStatistics);
  lastStatisticsRef.current = lastStatistics;

  const contextValue = React.useMemo(() => {
    const fit = currentFit.fit;
    const skills = currentCharacter.character?.skills;

    if (fit === null || skills === undefined || dogmaEngine === null || eveData === null) {
      return null;
    }

    const statistics: Statistics = {
      ...dogmaEngine.calculate(fit, skills),
      slots: {
        High: 0,
        Medium: 0,
        Low: 0,
        SubSystem: 0,
        Rig: 0,
        Launcher: 0,
        Turret: 0,
      },
      capacityUsed: 0,
    };

    CalculateSlots(eveData, statistics);
    statistics.capacityUsed = CalculateCargoBay(eveData, fit);

    if (!currentFit.isPreview) {
      setLastStatistics(statistics);
    }

    return {
      statistics: statistics,
      current: currentFit.isPreview ? lastStatisticsRef.current : statistics,
    };
  }, [eveData, dogmaEngine, currentFit.fit, currentFit.isPreview, currentCharacter.character?.skills]);

  return <StatisticsContext.Provider value={contextValue}>{props.children}</StatisticsContext.Provider>;
};
