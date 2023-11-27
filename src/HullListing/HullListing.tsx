import clsx from "clsx";
import React from "react";

import { EveDataContext } from "../EveDataProvider";
import { Icon } from "../Icon";

import styles from "./HullListing.module.css";

interface ListingHulls {
  [typeId: string]: string;
}

interface ListingGroup {
  [raceName: string]: ListingHulls;
}

interface ListingGroups {
  [groupName: string]: ListingGroup;
}

const factionIdToRace: Record<number, string> = {
  500001: "Caldari",
  500002: "Minmatar",
  500003: "Amarr",
  500004: "Gallente",
} as const;

const Hull = (props: { typeId: number, name: string, changeHull: (typeId: number) => void }) => {
  const [expanded, setExpanded] = React.useState(false);

  return <div>
    <div className={clsx(styles.header3, styles.hull)} onClick={() => setExpanded((current) => !current)}>
      <span>
        <img src={`https://images.evetech.net/types/${props.typeId}/icon?size=32`} alt="" />
      </span>
      <span>
        {props.name}
      </span>
      <span className={styles.hullSimulate} onClick={() => props.changeHull(props.typeId)}>
        <Icon name="simulate" size={32} />
      </span>
    </div>
    <div className={clsx(styles.level3, {[styles.collapsed]: !expanded})}>
    </div>
  </div>
}

const HullRace = (props: { name: string, entries: ListingHulls, changeHull: (typeId: number) => void }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (props.entries === undefined) return null;

  let children = <></>;
  if (expanded) {
    children = <>{Object.keys(props.entries).sort((a, b) => props.entries[a].localeCompare(props.entries[b])).map((typeId) => {
      const name = props.entries[typeId];
      return <Hull key={typeId} typeId={parseInt(typeId)} name={name} changeHull={props.changeHull} />
    })}</>;
  }

  return <div>
    <div className={styles.header2} onClick={() => setExpanded((current) => !current)}>
      {props.name} [{Object.keys(props.entries).length}]
    </div>
    <div className={clsx(styles.level2, {[styles.collapsed]: !expanded})}>
      {children}
    </div>
  </div>
}

const HullGroup = (props: { name: string, entries: ListingGroup, changeHull: (typeId: number) => void }) => {
  const [expanded, setExpanded] = React.useState(false);

  let children = <></>;
  if (expanded) {
    children = <>
      <HullRace name="Amarr" entries={props.entries.Amarr} changeHull={props.changeHull} />
      <HullRace name="Caldari" entries={props.entries.Caldari} changeHull={props.changeHull} />
      <HullRace name="Gallente" entries={props.entries.Gallente} changeHull={props.changeHull} />
      <HullRace name="Minmatar" entries={props.entries.Minmatar} changeHull={props.changeHull} />
      <HullRace name="Non-Empire" entries={props.entries.NonEmpire} changeHull={props.changeHull} />
    </>
  }

  return <div>
    <div className={styles.header1} onClick={() => setExpanded((current) => !current)}>
      {props.name}
    </div>
    <div className={clsx(styles.level1, {[styles.collapsed]: !expanded})}>
      {children}
    </div>
  </div>
};

/**
 * Show all the fittings for the current ESI character.
 */
export const HullListing = (props: { changeHull: (typeId: number) => void }) => {
  const eveData = React.useContext(EveDataContext);

  const [hullGroups, setHullGroups] = React.useState<ListingGroups>({});
  const [search, setSearch] = React.useState<string>("");

  React.useEffect(() => {
    if (!eveData.loaded) return;

    const newHullGroups: ListingGroups = {};

    for (const typeId in eveData.typeIDs) {
      const hull = eveData.typeIDs[typeId];
      if (hull.categoryID !== 6) continue;
      if (hull.marketGroupID === undefined) continue;
      if (!hull.published) continue;

      if (search !== "" && !hull.name.toLowerCase().includes(search.toLowerCase())) continue;

      const group = eveData.groupIDs?.[hull.groupID]?.name ?? "Unknown Group";
      const race = factionIdToRace[hull.factionID || 0] ?? "NonEmpire";

      if (newHullGroups[group] === undefined) {
        newHullGroups[group] = {};
      }
      if (newHullGroups[group][race] === undefined) {
        newHullGroups[group][race] = {};
      }

      newHullGroups[group][race][typeId] = hull.name;
    }

    setHullGroups(newHullGroups);
  }, [eveData, search]);

  return <div className={styles.listing}>
    <div className={styles.topbar}>
      <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
    <div className={styles.listingContent}>
      {Object.keys(hullGroups).sort().map((groupName) => {
        const groupData = hullGroups[groupName];
        return <HullGroup key={groupName} name={groupName} entries={groupData} changeHull={props.changeHull} />
      })}
    </div>
  </div>
};
