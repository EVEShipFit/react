import React from "react";

import { EveDataContext } from "../EveDataProvider";
import { ShipSnapshotContext } from "../ShipSnapshotProvider";

export interface ShipAttributeProps {
  /** Name of the attribute. */
  name: string;
  /** How many decimals to render. */
  fixed: number;
  /** Whether this is a resistance attribute. */
  isResistance?: boolean;
  /** With what value, if any, to divide the attribute value. */
  divideBy?: number;
}

/**
 * Return the value of a ship's attribute.
 */
export function useShipAttribute(props: ShipAttributeProps) {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  if (shipSnapshot?.loaded) {
    const attributeId = eveData.attributeMapping?.[props.name] || 0;
    let value = shipSnapshot.hull?.attributes.get(attributeId)?.value;
    let highIsGood = eveData.dogmaAttributes?.[attributeId]?.highIsGood;

    if (value == undefined) {
      return "?";
    }

    if (props.isResistance) {
      value = 100 - value * 100;
      highIsGood = !highIsGood;
    }

    if (props.divideBy) {
      value /= props.divideBy;
    }

    const k = Math.pow(10, props.fixed);
    if (k > 0) {
      if (highIsGood) {
        value -= 1 / k / 10;
        value = Math.ceil(value * k) / k;
      } else {
        value += 1 / k / 10;
        value = Math.floor(value * k) / k;
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
 * Render a single attribute of a ship's snapshot.
 */
export const ShipAttribute = (props: ShipAttributeProps) => {
  const stringValue = useShipAttribute(props);

  return <span>{stringValue}</span>;
};
