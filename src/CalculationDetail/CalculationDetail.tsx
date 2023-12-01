import clsx from "clsx";
import React from "react";

import { EveDataContext } from "../EveDataProvider";
import { ShipSnapshotContext, ShipSnapshotItemAttribute, ShipSnapshotItemAttributeEffect } from "../ShipSnapshotProvider";

import styles from "./CalculationDetail.module.css";
import { Icon } from "../Icon";

const EffectOperatorOrder: Record<string, string> = {
  "PreAssign": "=",
  "PreMul": "*",
  "PreDiv": "/",
  "ModAdd": "+",
  "ModSub": "-",
  "PostMul": "*",
  "PostDiv": "/",
  "PostPercent": "%",
  "PostAssignment": "=",
};

const Effect = (props: { effect: ShipSnapshotItemAttributeEffect }) => {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  const eveAttribute = eveData.dogmaAttributes?.[props.effect.source_attribute_id];

  let sourceName;
  let attribute;
  if (props.effect.source === "Ship") {
    sourceName = "Ship";
    attribute = shipSnapshot.hull?.attributes.get(props.effect.source_attribute_id);
  } else if (props.effect.source.Item !== undefined) {
    const item = shipSnapshot.items?.[props.effect.source.Item];
    if (item === undefined) {
      sourceName = "Unknown";
    } else {
      sourceName = eveData.typeIDs?.[item?.type_id]?.name;
      attribute = item?.attributes.get(props.effect.source_attribute_id);
    }
  }

  return <div className={styles.effect}>
    <span>{EffectOperatorOrder[props.effect.operator]}</span>
    <span>{attribute?.value || eveAttribute?.defaultValue}{props.effect.penalty ? " (penalized)" : ""}</span>
    <span>{sourceName} - {eveAttribute?.name}</span>
  </div>;
}

const CalculationDetailMeta = (props: { attributeId: number, attribute: ShipSnapshotItemAttribute }) => {
  const [expanded, setExpanded] = React.useState(false);
  const eveData = React.useContext(EveDataContext);

  const eveAttribute = eveData.dogmaAttributes?.[props.attributeId];
  let index = 0;

  const sortedEffects = props.attribute.effects.sort((a, b) => {
    const aIndex = Object.keys(EffectOperatorOrder).indexOf(a.operator);
    const bIndex = Object.keys(EffectOperatorOrder).indexOf(b.operator);
    if (aIndex === -1 || bIndex === -1) {
      return 0;
    }
    return aIndex - bIndex;
  });

  return <div className={styles.line}>
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
        <span>base value {props.attributeId < 0 && <>(list of effects might be incomplete)</>}</span>
      </div>
      {sortedEffects.map((effect) => {
        index += 1;
        return <Effect key={index} effect={effect} />
      })}
    </div>
  </div>
}

/**
 * Show in detail for each attribute how the value came to be. This includes
 * the base value, all effects (and their source) and the final value.
 */
export const CalculationDetail = (props: {source: "Ship" | { Item: number }}) => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  let attributes;
  if (props.source === "Ship") {
    attributes = [...shipSnapshot.hull?.attributes.entries() || []];
  } else if (props.source.Item !== undefined) {
    const item = shipSnapshot.items?.[props.source.Item];
    if (item !== undefined) {
      attributes = [...item.attributes.entries()];
    }
  }

  return <div>
    <div className={clsx(styles.entry, styles.header)}>
      <span></span>
      <span>Attribute</span>
      <span>Value</span>
      <span>Effects</span>
    </div>
    {attributes?.map(([attributeId, attribute]) => {
      return <CalculationDetailMeta key={attributeId} attributeId={attributeId} attribute={attribute} />
    })}
  </div>
};
