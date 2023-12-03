import clsx from "clsx";
import React from "react";

import { EsiContext } from "../EsiProvider";
import { EsiFit, ShipSnapshotContext } from "../ShipSnapshotProvider";
import { EveDataContext } from "../EveDataProvider";
import { Icon } from "../Icon";
import { TreeListing, TreeHeader, TreeHeaderAction, TreeLeaf } from "../TreeListing";

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
  1: "Non-Empire",
} as const;

const Hull = (props: { typeId: number, entry: ListingFit, changeHull: (typeId: number) => void, changeFit: (fit: EsiFit) => void }) => {
  const getChildren = React.useCallback(() => {
    if (props.entry.fits.length === 0) {
      return <TreeLeaf level={4} content={"No Item"} />;
    } else {
      let index = 0;
      return <>{props.entry.fits.map((fit) => {
        index += 1;
        return <TreeLeaf key={`${fit.ship_type_id}-${index}`} level={4} content={fit.name} onClick={() => props.changeFit(fit)} />;
      })}</>;
    }
  }, [props]);

  function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    props.changeHull(props.typeId);
  }

  const headerAction = <TreeHeaderAction icon="simulate" onClick={onClick} />;
  const header = <TreeHeader icon={`https://images.evetech.net/types/${props.typeId}/icon?size=32`} text={props.entry.name} action={headerAction} />;
  return <TreeListing level={3} header={header} height={32} getChildren={getChildren} />;
}

const HullRace = (props: { raceId: number, entries: ListingHulls, changeHull: (typeId: number) => void, changeFit: (fit: EsiFit) => void }) => {
  const getChildren = React.useCallback(() => {
    const changeProps = {
      changeHull: props.changeHull,
      changeFit: props.changeFit,
    };

    return <>{Object.keys(props.entries).sort((a, b) => props.entries[a].name.localeCompare(props.entries[b].name)).map((typeId) => {
      const entry = props.entries[typeId];
      return <Hull key={typeId} typeId={parseInt(typeId)} entry={entry} {...changeProps} />
    })}</>;
  }, [props]);

  if (props.entries === undefined) return null;

  const header = <TreeHeader icon={`https://images.evetech.net/corporations/${props.raceId}/logo?size=32`} text={`${factionIdToRace[props.raceId]} [${Object.keys(props.entries).length}]`} />;
  return <TreeListing level={2} header={header} getChildren={getChildren} />;
}

const HullGroup = (props: { name: string, entries: ListingGroup, changeHull: (typeId: number) => void, changeFit: (fit: EsiFit) => void }) => {
  const getChildren = React.useCallback(() => {
    const changeProps = {
      changeHull: props.changeHull,
      changeFit: props.changeFit,
    };

    return <>
      <HullRace raceId={500003} entries={props.entries.Amarr} {...changeProps} />
      <HullRace raceId={500001} entries={props.entries.Caldari} {...changeProps} />
      <HullRace raceId={500004} entries={props.entries.Gallente} {...changeProps} />
      <HullRace raceId={500002} entries={props.entries.Minmatar} {...changeProps} />
      <HullRace raceId={1} entries={props.entries.NonEmpire} {...changeProps} />
    </>;
  }, [props]);

  const header = <TreeHeader text={`${props.name}`} />;
  return <TreeListing level={1} header={header} getChildren={getChildren} />;
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
        <Icon name="fitting-character" size={32} title="Filter: in-game personal fittings" />
      </span>
      <span className={styles.disabled}>
        <Icon name="fitting-corporation" size={32} title="CCP didn't implement this ESI endpoint (yet?)" />
      </span>
      <span className={styles.disabled}>
        <Icon name="fitting-alliance" size={32} title="CCP didn't implement this ESI endpoint (yet?)" />
      </span>
      <span className={clsx({[styles.selected]: filter.currentHull})} onClick={() => setFilter({...filter, currentHull: !filter.currentHull})}>
        <Icon name="fitting-hull" size={32} title="Filter: current hull" />
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
