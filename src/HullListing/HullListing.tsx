import clsx from "clsx";
import React from "react";

import { EsiContext } from "../EsiProvider";
import { EsiFit, ShipSnapshotContext } from "../ShipSnapshotProvider";
import { EveDataContext } from "../EveDataProvider";
import { Icon, IconName } from "../Icon";
import { TreeListing, TreeHeader, TreeHeaderAction, TreeLeaf } from "../TreeListing";
import { LocalFitContext } from "../LocalFitProvider";

import styles from "./HullListing.module.css";

interface ListingFit {
  origin: "local" | "esi-character";
  fit: EsiFit;
}

interface ListingHull {
  name: string;
  fits: ListingFit[];
}

interface ListingHulls {
  [typeId: string]: ListingHull;
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

const Hull = (props: { typeId: number, entry: ListingHull }) => {
  const shipSnapShot = React.useContext(ShipSnapshotContext);

  const getChildren = React.useCallback(() => {
    if (props.entry.fits.length === 0) {
      return <TreeLeaf level={4} content={"No Item"} />;
    } else {
      let index = 0;
      return <>{props.entry.fits.sort((a, b) => a.fit.name.localeCompare(b.fit.name)).map((fit) => {
        index += 1;

        let icon: IconName | undefined;
        let iconTitle: string | undefined;
        switch (fit.origin) {
          case "local":
            icon = "fitting-local";
            iconTitle = "Browser-stored fitting";
            break;

          case "esi-character":
            icon = "fitting-character";
            iconTitle = "In-game personal fitting";
            break;
        }

        return <TreeLeaf key={`${fit.fit.ship_type_id}-${index}`} level={4} content={fit.fit.name} onClick={() => shipSnapShot.changeFit(fit.fit)} icon={icon} iconTitle={iconTitle} />;
      })}</>;
    }
  }, [props, shipSnapShot]);

  const onClick = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    shipSnapShot.changeHull(props.typeId);
  }, [props, shipSnapShot]);

  const headerAction = <TreeHeaderAction icon="simulate" onClick={onClick} />;
  const header = <TreeHeader icon={`https://images.evetech.net/types/${props.typeId}/icon?size=32`} text={props.entry.name} action={headerAction} />;
  return <TreeListing level={3} header={header} height={32} getChildren={getChildren} />;
}

const HullRace = (props: { raceId: number, entries: ListingHulls }) => {
  const getChildren = React.useCallback(() => {
    return <>{Object.keys(props.entries).sort((a, b) => props.entries[a].name.localeCompare(props.entries[b].name)).map((typeId) => {
      const entry = props.entries[typeId];
      return <Hull key={typeId} typeId={parseInt(typeId)} entry={entry} />
    })}</>;
  }, [props]);

  if (props.entries === undefined) return null;

  const header = <TreeHeader icon={`https://images.evetech.net/corporations/${props.raceId}/logo?size=32`} text={`${factionIdToRace[props.raceId]} [${Object.keys(props.entries).length}]`} />;
  return <TreeListing level={2} header={header} getChildren={getChildren} />;
}

const HullGroup = (props: { name: string, entries: ListingGroup }) => {
  const getChildren = React.useCallback(() => {
    return <>
      <HullRace raceId={500003} entries={props.entries.Amarr} />
      <HullRace raceId={500001} entries={props.entries.Caldari} />
      <HullRace raceId={500004} entries={props.entries.Gallente} />
      <HullRace raceId={500002} entries={props.entries.Minmatar} />
      <HullRace raceId={1} entries={props.entries.NonEmpire} />
    </>;
  }, [props]);

  const header = <TreeHeader text={`${props.name}`} />;
  return <TreeListing level={1} header={header} getChildren={getChildren} />;
};

/**
 * Show all the fittings for the current ESI character.
 */
export const HullListing = () => {
  const esi = React.useContext(EsiContext);
  const localFit = React.useContext(LocalFitContext);
  const eveData = React.useContext(EveDataContext);
  const shipSnapShot = React.useContext(ShipSnapshotContext);

  const [hullGroups, setHullGroups] = React.useState<ListingGroups>({});
  const [search, setSearch] = React.useState<string>("");
  const [filter, setFilter] = React.useState({
    localCharacter: false,
    esiCharacter: false,
    currentHull: false,
  });

  const [localCharacterFits, setLocalCharacterFits] = React.useState<Record<string, ListingFit[]>>({});
  const [esiCharacterFits, setEsiCharacterFits] = React.useState<Record<string, ListingFit[]>>({});

  React.useEffect(() => {
    if (!localFit.loaded) return;
    if (!localFit.fittings) return;

    const newLocalCharacterFits: Record<string, ListingFit[]> = {};
    for (const fit of localFit.fittings) {
      if (fit.ship_type_id === undefined) continue;

      if (newLocalCharacterFits[fit.ship_type_id] === undefined) {
        newLocalCharacterFits[fit.ship_type_id] = [];
      }

      newLocalCharacterFits[fit.ship_type_id].push({
        origin: "local",
        fit
      });
    }

    setLocalCharacterFits(newLocalCharacterFits);
  }, [localFit]);

  React.useEffect(() => {
    if (!esi.loaded) return;
    if (!esi.currentCharacter) return;

    const charFittings = esi.characters[esi.currentCharacter].charFittings || [];

    const newEsiCharacterFits: Record<string, ListingFit[]> = {};
    for (const fit of charFittings) {
      if (fit.ship_type_id === undefined) continue;

      if (newEsiCharacterFits[fit.ship_type_id] === undefined) {
        newEsiCharacterFits[fit.ship_type_id] = [];
      }

      newEsiCharacterFits[fit.ship_type_id].push({
        origin: "esi-character",
        fit,
      });
    }

    setEsiCharacterFits(newEsiCharacterFits);
  }, [esi]);

  React.useEffect(() => {
    if (!eveData.loaded) return;
    const anyFilter = filter.localCharacter || filter.esiCharacter;

    const newHullGroups: ListingGroups = {};

    for (const typeId in eveData.typeIDs) {
      const hull = eveData.typeIDs[typeId];
      if (hull.categoryID !== 6) continue;
      if (hull.marketGroupID === undefined) continue;
      if (!hull.published) continue;

      if (filter.currentHull && shipSnapShot.fit?.ship_type_id !== parseInt(typeId)) continue;

      const fits: ListingFit[] = [];
      if (anyFilter) {
        if (filter.localCharacter && Object.keys(localCharacterFits).includes(typeId)) fits.push(...localCharacterFits[typeId]);
        if (filter.esiCharacter && Object.keys(esiCharacterFits).includes(typeId)) fits.push(...esiCharacterFits[typeId]);
        if (fits.length == 0) {
          if (!filter.currentHull || shipSnapShot.fit?.ship_type_id !== parseInt(typeId)) continue;
        }
      } else {
        if (Object.keys(localCharacterFits).includes(typeId)) fits.push(...localCharacterFits[typeId]);
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
  }, [eveData, search, filter, localCharacterFits, esiCharacterFits, shipSnapShot.fit?.ship_type_id]);

  return <div className={styles.listing}>
    <div className={styles.topbar}>
      <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
    <div className={styles.filter}>
      <span className={clsx({[styles.selected]: filter.localCharacter})} onClick={() => setFilter({...filter, localCharacter: !filter.localCharacter})}>
        <Icon name="fitting-local" size={32} title="Filter: Browser-stored fittings" />
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
        return <HullGroup key={groupName} name={groupName} entries={groupData} />
      })}
    </div>
  </div>
};
