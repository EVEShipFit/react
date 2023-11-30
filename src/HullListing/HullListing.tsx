import clsx from "clsx";
import React from "react";

import { EsiContext } from "../EsiProvider";
import { EsiFit, ShipSnapshotContext } from "../ShipSnapshotProvider";
import { EveDataContext } from "../EveDataProvider";
import { Icon } from "../Icon";

import styles from "./HullListing.module.css";

interface ListingFit {
  name: string;
  fits: EsiFit[];
}

interface ListingHulls {
  [typeId: string]: ListingFit;
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

const Hull = (props: { typeId: number, entry: ListingFit, changeHull: (typeId: number) => void, changeFit: (fit: EsiFit) => void }) => {
  const [expanded, setExpanded] = React.useState(false);

  let children = <></>;
  if (expanded) {
    if (props.entry.fits.length === 0) {
      children = <>
        <div className={clsx(styles.header4, styles.fit, styles.noitem)}>
          No Item
        </div>
      </>;
    } else {
      let index = 0;
      children = <>{props.entry.fits.map((fit) => {
        index += 1;
        return <div key={`${fit.ship_type_id}-${index}`} className={clsx(styles.header4, styles.fit)} onClick={() => props.changeFit(fit)}>
          {fit.name}
        </div>
      })}</>;
    }
  }

  return <div>
    <div className={clsx(styles.header3, styles.hull)} onClick={() => setExpanded((current) => !current)}>
      <span>
        <Icon name={expanded ? "menu-expand" : "menu-collapse"} size={12} />
      </span>
      <span>
        <img src={`https://images.evetech.net/types/${props.typeId}/icon?size=32`} alt="" />
      </span>
      <span>
        {props.entry.name}
      </span>
      <span className={styles.hullSimulate} onClick={() => props.changeHull(props.typeId)}>
        <Icon name="simulate" size={32} />
      </span>
    </div>
    <div className={clsx(styles.level3, {[styles.collapsed]: !expanded})}>
      {children}
    </div>
  </div>
}

const HullRace = (props: { name: string, entries: ListingHulls, changeHull: (typeId: number) => void, changeFit: (fit: EsiFit) => void }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (props.entries === undefined) return null;

  let children = <></>;
  if (expanded) {
    const changeProps = {
      changeHull: props.changeHull,
      changeFit: props.changeFit,
    };

    children = <>{Object.keys(props.entries).sort((a, b) => props.entries[a].name.localeCompare(props.entries[b].name)).map((typeId) => {
      const entry = props.entries[typeId];
      return <Hull key={typeId} typeId={parseInt(typeId)} entry={entry} {...changeProps} />
    })}</>;
  }

  return <div>
    <div className={styles.header2} onClick={() => setExpanded((current) => !current)}>
      <span>
        <Icon name={expanded ? "menu-expand" : "menu-collapse"} size={12} />
      </span>
      {props.name} [{Object.keys(props.entries).length}]
    </div>
    <div className={clsx(styles.level2, {[styles.collapsed]: !expanded})}>
      {children}
    </div>
  </div>
}

const HullGroup = (props: { name: string, entries: ListingGroup, changeHull: (typeId: number) => void, changeFit: (fit: EsiFit) => void }) => {
  const [expanded, setExpanded] = React.useState(false);

  let children = <></>;
  if (expanded) {
    const changeProps = {
      changeHull: props.changeHull,
      changeFit: props.changeFit,
    };

    children = <>
      <HullRace name="Amarr" entries={props.entries.Amarr} {...changeProps} />
      <HullRace name="Caldari" entries={props.entries.Caldari} {...changeProps} />
      <HullRace name="Gallente" entries={props.entries.Gallente} {...changeProps} />
      <HullRace name="Minmatar" entries={props.entries.Minmatar} {...changeProps} />
      <HullRace name="Non-Empire" entries={props.entries.NonEmpire} {...changeProps} />
    </>;
  }

  return <div>
    <div className={styles.header1} onClick={() => setExpanded((current) => !current)}>
      <span>
        <Icon name={expanded ? "menu-expand" : "menu-collapse"} size={12} />
      </span>
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
export const HullListing = (props: { changeHull: (typeId: number) => void, changeFit: (fit: EsiFit) => void }) => {
  const esi = React.useContext(EsiContext);
  const eveData = React.useContext(EveDataContext);
  const shipSnapShot = React.useContext(ShipSnapshotContext);

  const [hullGroups, setHullGroups] = React.useState<ListingGroups>({});
  const [search, setSearch] = React.useState<string>("");
  const [filter, setFilter] = React.useState({
    esiCharacter: false,
    currentHull: false,
  });

  const [esiCharacterFits, setEsiCharacterFits] = React.useState<Record<string, EsiFit[]>>({});

  React.useEffect(() => {
    if (!esi.loaded) return;
    if (!esi.currentCharacter) return;

    const charFittings = esi.characters[esi.currentCharacter].charFittings || [];

    const newEsiCharacterFits: Record<string, EsiFit[]> = {};
    for (const fit of charFittings) {
      if (fit.ship_type_id === undefined) continue;

      if (newEsiCharacterFits[fit.ship_type_id] === undefined) {
        newEsiCharacterFits[fit.ship_type_id] = [];
      }

      newEsiCharacterFits[fit.ship_type_id].push(fit);
    }

    setEsiCharacterFits(newEsiCharacterFits);
  }, [esi]);

  React.useEffect(() => {
    if (!eveData.loaded) return;
    const anyFilter = filter.esiCharacter;

    const newHullGroups: ListingGroups = {};

    for (const typeId in eveData.typeIDs) {
      const hull = eveData.typeIDs[typeId];
      if (hull.categoryID !== 6) continue;
      if (hull.marketGroupID === undefined) continue;
      if (!hull.published) continue;

      if (filter.currentHull && shipSnapShot.fit?.ship_type_id !== parseInt(typeId)) continue;

      const fits: EsiFit[] = [];
      if (anyFilter) {
        if (filter.esiCharacter && Object.keys(esiCharacterFits).includes(typeId)) fits.push(...esiCharacterFits[typeId]);
        if (fits.length == 0) {
          if (!filter.currentHull || shipSnapShot.fit?.ship_type_id !== parseInt(typeId)) continue;
        }
      } else {
        if (Object.keys(esiCharacterFits).includes(typeId)) fits.push(...esiCharacterFits[typeId]);
      }

      if (search !== "" && !hull.name.toLowerCase().includes(search.toLowerCase())) continue;

      const group = eveData.groupIDs?.[hull.groupID]?.name ?? "Unknown Group";
      const race = factionIdToRace[hull.factionID || 0] ?? "NonEmpire";

      if (newHullGroups[group] === undefined) {
        newHullGroups[group] = {};
      }
      if (newHullGroups[group][race] === undefined) {
        newHullGroups[group][race] = {};
      }

      newHullGroups[group][race][typeId] = {
        name: hull.name,
        fits,
      }
    }

    setHullGroups(newHullGroups);
  }, [eveData, search, filter, esiCharacterFits, shipSnapShot.fit?.ship_type_id]);

  return <div className={styles.listing}>
    <div className={styles.topbar}>
      <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
    <div className={styles.filter}>
      <span className={styles.disabled}>
        <Icon name="fitting-local" size={32} title="Not yet implemented" />
      </span>
      <span className={clsx({[styles.selected]: filter.esiCharacter})} onClick={() => setFilter({...filter, esiCharacter: !filter.esiCharacter})}>
        <Icon name="fitting-character" size={32} title="In-game character fits" />
      </span>
      <span className={styles.disabled}>
        <Icon name="fitting-corporation" size={32} title="CCP didn't implement this ESI endpoint (yet?)" />
      </span>
      <span className={styles.disabled}>
        <Icon name="fitting-alliance" size={32} title="CCP didn't implement this ESI endpoint (yet?)" />
      </span>
      <span className={clsx({[styles.selected]: filter.currentHull})} onClick={() => setFilter({...filter, currentHull: !filter.currentHull})}>
        <Icon name="fitting-hull" size={32} title="Current hull" />
      </span>
    </div>
    <div className={styles.listingContent}>
      {Object.keys(hullGroups).sort().map((groupName) => {
        const groupData = hullGroups[groupName];
        return <HullGroup key={groupName} name={groupName} entries={groupData} changeHull={props.changeHull} changeFit={props.changeFit} />
      })}
    </div>
  </div>
};
