import React from "react";

import { EveDataContext } from "@/providers/EveDataProvider";
import { ShipSnapshotContext } from "@/providers/ShipSnapshotProvider";

export interface AttributeProps {
  /** Name of the attribute. */
  name: string;
  /** How many decimals to render. */
  fixed: number;
  /** Whether this is a resistance attribute. */
  isResistance?: boolean;
  /** With what value, if any, to divide the attribute value. */
  divideBy?: number;
  /** Whether to forcefully round down. */
  roundDown?: boolean;
}

/**
 * Return the value of a ship's attribute.
 */
export function useAttribute(type: "Ship" | "Char", props: AttributeProps) {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  if (shipSnapshot?.loaded) {
    const attributeId = eveData.attributeMapping?.[props.name] || 0;
    let value;
    if (type === "Ship") {
      value = shipSnapshot.hull?.attributes.get(attributeId)?.value;
    } else {
      value = shipSnapshot.char?.attributes.get(attributeId)?.value;
    }

    if (value == undefined) {
      return "?";
    }

    if (props.isResistance) {
      value = 100 - value * 100;
    }

    if (props.divideBy) {
      value /= props.divideBy;
    }

    const k = Math.pow(10, props.fixed);
    if (k > 0) {
      if (props.isResistance) {
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

    return value.toLocaleString("en", {
      minimumFractionDigits: props.fixed,
      maximumFractionDigits: props.fixed,
    });
  }
}

/**
 * Render a single ship attribute of a ship's snapshot.
 */
export const ShipAttribute = (props: AttributeProps) => {
  const stringValue = useAttribute("Ship", props);

  return <span>{stringValue}</span>;
};

/**
 * Render a single character attribute of a ship's snapshot.
 */
export const CharAttribute = (props: AttributeProps) => {
  const stringValue = useAttribute("Char", props);

  return <span>{stringValue}</span>;
};
