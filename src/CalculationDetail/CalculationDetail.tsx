import clsx from "clsx";
import React from "react";

import { EveDataContext } from "../EveDataProvider";
import {
  ShipSnapshotContext,
  ShipSnapshotItemAttribute,
  ShipSnapshotItemAttributeEffect,
} from "../ShipSnapshotProvider";

import styles from "./CalculationDetail.module.css";
import { Icon } from "../Icon";

const EffectOperatorOrder: Record<string, string> = {
  PreAssign: "=",
  PreMul: "*",
  PreDiv: "/",
  ModAdd: "+",
  ModSub: "-",
  PostMul: "*",
  PostDiv: "/",
  PostPercent: "%",
  PostAssignment: "=",
};

const Effect = (props: { effect: ShipSnapshotItemAttributeEffect }) => {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  const eveAttribute = eveData.dogmaAttributes?.[props.effect.source_attribute_id];

  let sourceName = "Unknown";
  let attribute = undefined;

  if (props.effect.source === "Ship") {
    sourceName = "Ship";
    attribute = shipSnapshot.hull?.attributes.get(props.effect.source_attribute_id);
  } else if (props.effect.source === "Char") {
    sourceName = "Char";
    attribute = shipSnapshot.char?.attributes.get(props.effect.source_attribute_id);
  } else if (props.effect.source === "Structure") {
    sourceName = "Structure";
    attribute = shipSnapshot.structure?.attributes.get(props.effect.source_attribute_id);
  } else if (props.effect.source === "Target") {
    sourceName = "Target";
    attribute = shipSnapshot.target?.attributes.get(props.effect.source_attribute_id);
  } else {
    let item = undefined;
    let sourceType = undefined;

    /* Lookup the source of the effect. */
    if (props.effect.source.Item !== undefined) {
      item = shipSnapshot.items?.[props.effect.source.Item];
      sourceType = "Item";
    } else if (props.effect.source.Skill !== undefined) {
      item = shipSnapshot.skills?.[props.effect.source.Skill];
      sourceType = "Skill";
    } else if (props.effect.source.Charge !== undefined) {
      item = shipSnapshot.items?.[props.effect.source.Charge].charge;
      sourceType = "Charge";
    }

    /* Find the attribute on the source. */
    if (item === undefined) {
      sourceName = `Unknown ${sourceType}`;
    } else {
      sourceName = `${sourceType} - ` + eveData.typeIDs?.[item?.type_id]?.name ?? sourceName;
      attribute = item?.attributes.get(props.effect.source_attribute_id);
    }
  }

  return (
    <div className={styles.effect}>
      <span>{EffectOperatorOrder[props.effect.operator]}</span>
      <span>
        {attribute?.value || eveAttribute?.defaultValue}
        {props.effect.penalty ? " (penalized)" : ""}
        {attribute?.value === undefined ? " (default)" : ""}
      </span>
      <span>
        {sourceName} - {eveAttribute?.name}
      </span>
    </div>
  );
};

const CalculationDetailMeta = (props: { attributeId: number; attribute: ShipSnapshotItemAttribute }) => {
  const [expanded, setExpanded] = React.useState(false);
  const eveData = React.useContext(EveDataContext);

  const eveAttribute = eveData.dogmaAttributes?.[props.attributeId];
  const sortedEffects = props.attribute.effects.sort((a, b) => {
    const aIndex = Object.keys(EffectOperatorOrder).indexOf(a.operator);
    const bIndex = Object.keys(EffectOperatorOrder).indexOf(b.operator);
    if (aIndex === -1 || bIndex === -1) {
      return 0;
    }
    return aIndex - bIndex;
  });

  let index = 0;
  return (
    <div className={styles.line}>
      <div className={styles.entry} onClick={() => setExpanded(!expanded)}>
        <span>
          <Icon name={expanded ? "menu-expand" : "menu-collapse"} />
        </span>
        <span>{eveAttribute?.name}</span>
        <span>{props.attribute.value}</span>
        <span>{props.attribute.effects.length}</span>
      </div>
      <div className={clsx(styles.effects, { [styles.collapsed]: !expanded })}>
        <div className={styles.effect}>
          <span>=</span>
          <span>{props.attribute.base_value}</span>
          <span>Base value {props.attributeId < 0 && <>(list of effects might be incomplete)</>}</span>
        </div>
        {sortedEffects.map((effect) => {
          index += 1;
          return <Effect key={index} effect={effect} />;
        })}
      </div>
    </div>
  );
};

/**
 * Show in detail for each attribute how the value came to be. This includes
 * the base value, all effects (and their source) and the final value.
 */
export const CalculationDetail = (props: {
  source: "Ship" | "Char" | "Structure" | "Target" | { Item?: number; Charge?: number };
}) => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  let attributes: [number, ShipSnapshotItemAttribute][] = [];

  if (props.source === "Ship") {
    attributes = [...(shipSnapshot.hull?.attributes.entries() || [])];
  } else if (props.source === "Char") {
    attributes = [...(shipSnapshot.char?.attributes.entries() || [])];
  } else if (props.source === "Structure") {
    attributes = [...(shipSnapshot.structure?.attributes.entries() || [])];
  } else if (props.source === "Target") {
    attributes = [...(shipSnapshot.target?.attributes.entries() || [])];
  } else if (props.source.Item !== undefined) {
    const item = shipSnapshot.items?.[props.source.Item];
    if (item !== undefined) {
      attributes = [...item.attributes.entries()];
    }
  } else if (props.source.Charge !== undefined) {
    const item = shipSnapshot.items?.[props.source.Charge].charge;
    if (item !== undefined) {
      attributes = [...item.attributes.entries()];
    }
  }

  return (
    <div>
      <div className={clsx(styles.entry, styles.header)}>
        <span></span>
        <span>Attribute</span>
        <span>Value</span>
        <span>Effects</span>
      </div>
      {attributes?.map(([attributeId, attribute]) => {
        return <CalculationDetailMeta key={attributeId} attributeId={attributeId} attribute={attribute} />;
      })}
    </div>
  );
};
