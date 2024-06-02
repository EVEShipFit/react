import clsx from "clsx";
import React from "react";

import { useEveData } from "@/providers/EveDataProvider";
import { useCurrentStatistics, useStatistics } from "@/providers/StatisticsProvider";

import styles from "./ShipAttribute.module.css";

export interface AttributeProps {
  /** Name of the attribute. */
  name: string;
  /** The unit of the attribute, used as postfix. */
  unit?: string;
  /** How many decimals to render. */
  fixed: number;
  /** Whether this is a resistance attribute. */
  isResistance?: boolean;
  /** With what value, if any, to divide the attribute value. */
  divideBy?: number;
  /** Whether to forcefully round down. */
  roundDown?: boolean;
  /** Whether to forcefully round up. */
  roundUp?: boolean;
}

export enum AttributeChange {
  Increase = "Increase",
  Decrease = "Decrease",
  Unchanged = "Unchanged",
  Unknown = "Unknown",
}

/**
 * Return the value of a ship's attribute.
 */
export function useAttribute(type: "Ship" | "Char", props: AttributeProps): { value: string; change: AttributeChange } {
  const eveData = useEveData();
  const statistics = useStatistics();
  const currentStatistics = useCurrentStatistics();

  const attributeId = eveData?.attributeMapping[props.name] ?? 0;

  let value;
  let currentValue;
  if (eveData === null || statistics === null) {
    value = 0;
    currentValue = 0;
  } else {
    if (type === "Ship" && props.name === "capacityUsed") {
      value = statistics.capacityUsed;
      currentValue = currentStatistics?.capacityUsed;
    } else if (type === "Ship") {
      value = statistics.hull.attributes.get(attributeId)?.value;
      currentValue = currentStatistics?.hull.attributes.get(attributeId)?.value;
    } else {
      value = statistics.char.attributes.get(attributeId)?.value;
      currentValue = currentStatistics?.char.attributes.get(attributeId)?.value;
    }
  }

  if (value === undefined) {
    return {
      value: "?",
      change: AttributeChange.Unknown,
    };
  }

  let change = AttributeChange.Unchanged;
  if (currentValue !== undefined && currentValue !== value) {
    const highIsGood =
      props.isResistance || props.name === "mass" ? false : eveData?.dogmaAttributes[attributeId]?.highIsGood;

    if (currentValue < value) {
      change = highIsGood ? AttributeChange.Increase : AttributeChange.Decrease;
    } else {
      change = highIsGood ? AttributeChange.Decrease : AttributeChange.Increase;
    }
  }

  if (props.isResistance) {
    value = 100 - value * 100;
  }

  if (props.divideBy) {
    value /= props.divideBy;
  }

  const k = Math.pow(10, props.fixed);
  if (k > 0) {
    if (props.isResistance || props.roundUp) {
      value -= 1 / k / 10;
      value = Math.ceil(value * k) / k;
    } else if (props.roundDown) {
      value = Math.floor(value * k) / k;
    } else {
      value = Math.round(value * k) / k;
    }
  }

  /* Make sure we don't display "-0", but "0" instead. */
  if (Object.is(value, -0)) {
    value = 0;
  }

  return {
    value: value.toLocaleString("en", {
      minimumFractionDigits: props.fixed,
      maximumFractionDigits: props.fixed,
    }),
    change,
  };
}

/**
 * Render a single ship attribute of a ship's snapshot.
 */
export const ShipAttribute = (props: AttributeProps) => {
  const { value, change } = useAttribute("Ship", props);
  const prefix =
    props.unit === undefined
      ? ""
      : props.unit === "s" || props.unit === "x" || props.unit === "%"
        ? props.unit
        : ` ${props.unit}`;

  return (
    <span
      className={clsx({
        [styles.increase]: change === AttributeChange.Increase,
        [styles.decrease]: change === AttributeChange.Decrease,
      })}
    >
      {value}
      {prefix}
    </span>
  );
};

/**
 * Render a single character attribute of a ship's snapshot.
 */
export const CharAttribute = (props: AttributeProps) => {
  const { value, change } = useAttribute("Char", props);
  const prefix =
    props.unit === undefined
      ? ""
      : props.unit === "s" || props.unit === "x" || props.unit === "%"
        ? props.unit
        : ` ${props.unit}`;

  return (
    <span
      className={clsx({
        [styles.increase]: change === AttributeChange.Increase,
        [styles.decrease]: change === AttributeChange.Decrease,
      })}
    >
      {value}
      {prefix}
    </span>
  );
};
