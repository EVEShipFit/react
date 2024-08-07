import clsx from "clsx";
import React from "react";

import { Icon } from "@/components/Icon";
import { useEveData } from "@/providers/EveDataProvider";
import { useStatistics } from "@/providers/StatisticsProvider";
import { CalculationItemAttribute, CalculationItemAttributeEffect } from "@/providers/DogmaEngineProvider";

import styles from "./CalculationDetail.module.css";

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

function stateToInteger(state: string): number {
  switch (state) {
    case "Passive":
      return 0;
    case "Online":
      return 1;
    case "Active":
      return 2;
    case "Overload":
      return 3;
    case "Target":
      return 4;
    case "Area":
      return 5;
    case "Dungeon":
      return 6;
    case "System":
      return 7;
    default:
      return 8;
  }
}

const Effect = (props: { effect: CalculationItemAttributeEffect }) => {
  const eveData = useEveData();
  const statistics = useStatistics();

  if (eveData === null || statistics === null) return <></>;

  const eveAttribute = eveData.dogmaAttributes[props.effect.source_attribute_id];

  let sourceName = "Unknown";
  let attribute = undefined;
  let applied = true;

  switch (props.effect.source) {
    case "Ship":
      sourceName = "Ship";
      attribute = statistics.hull.attributes.get(props.effect.source_attribute_id);
      break;

    case "Char":
      sourceName = "Character";
      attribute = statistics.char.attributes.get(props.effect.source_attribute_id);
      break;

    case "Structure":
      sourceName = "Structure";
      attribute = statistics.structure.attributes.get(props.effect.source_attribute_id);
      break;

    case "Target":
      sourceName = "Target";
      attribute = statistics.target.attributes.get(props.effect.source_attribute_id);
      break;

    default:
      let item = undefined;
      let sourceType = undefined;

      /* Lookup the source of the effect. */
      if (props.effect.source.Item !== undefined) {
        item = statistics.items[props.effect.source.Item];
        sourceType = "Item";
      } else if (props.effect.source.Skill !== undefined) {
        item = statistics.skills[props.effect.source.Skill];
        sourceType = "Skill";
      } else if (props.effect.source.Charge !== undefined) {
        item = statistics.items[props.effect.source.Charge].charge;
        sourceType = "Charge";
      }

      /* Find the attribute on the source. */
      if (item === undefined) {
        sourceName = `Unknown ${sourceType}`;
      } else {
        sourceName = `${sourceType}: ` + (eveData.types?.[item?.type_id]?.name ?? sourceName);
        attribute = item?.attributes.get(props.effect.source_attribute_id);

        const itemState = stateToInteger(item.state);
        const sourceState = stateToInteger(props.effect.source_category);
        if (itemState < sourceState) {
          applied = false;
        }
      }
      break;
  }

  return (
    <div className={clsx(styles.effect, { [styles.notApplied]: !applied })}>
      <span>{EffectOperatorOrder[props.effect.operator]}</span>
      <span>
        {attribute?.value ?? eveAttribute?.defaultValue}
        {props.effect.penalty ? " (penalized)" : ""}
        {attribute?.value === undefined ? " (default)" : ""}
      </span>
      <span>
        {sourceName} - {eveAttribute?.name}
        {!applied && " (not applied)"}
      </span>
    </div>
  );
};

const CalculationDetailMeta = (props: { attributeId: number; attribute: CalculationItemAttribute }) => {
  const [expanded, setExpanded] = React.useState(false);
  const eveData = useEveData();

  if (eveData === null) return <></>;

  const eveAttribute = eveData.dogmaAttributes[props.attributeId];
  const sortedEffects = Object.values(props.attribute.effects).sort((a, b) => {
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
  const statistics = useStatistics();
  if (statistics === null) return <></>;

  let attributes: [number, CalculationItemAttribute][] = [];

  if (props.source === "Ship") {
    attributes = [...(statistics.hull.attributes.entries() ?? [])];
  } else if (props.source === "Char") {
    attributes = [...(statistics.char.attributes.entries() ?? [])];
  } else if (props.source === "Structure") {
    attributes = [...(statistics.structure.attributes.entries() ?? [])];
  } else if (props.source === "Target") {
    attributes = [...(statistics.target.attributes.entries() ?? [])];
  } else if (props.source.Item !== undefined) {
    const item = statistics.items[props.source.Item];
    if (item !== undefined) {
      attributes = [...item.attributes.entries()];
    }
  } else if (props.source.Charge !== undefined) {
    const item = statistics.items[props.source.Charge].charge;
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
