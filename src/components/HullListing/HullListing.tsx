import clsx from "clsx";
import React from "react";

import { Icon, IconName } from "@/components/Icon";
import { TreeListing, TreeHeader, TreeHeaderAction, TreeLeaf } from "@/components/TreeListing";
import { EsfFit, useCurrentFit } from "@/providers/CurrentFitProvider";
import { useFitManager } from "@/providers/FitManagerProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { useCurrentCharacter } from "@/providers/CurrentCharacterProvider";
import { useLocalFits } from "@/providers/LocalFitsProvider";

import styles from "./HullListing.module.css";

interface ListingFit {
  origin: "local" | "character";
  fit: EsfFit;
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

const Hull = (props: { typeId: number; entry: ListingHull }) => {
  const fitManager = useFitManager();

  const getChildren = React.useCallback(() => {
    if (props.entry.fits.length === 0) {
      return <TreeLeaf level={4} content={"No Item"} />;
    } else {
      let index = 0;
      return (
        <>
          {Object.values(props.entry.fits)
            .sort((a, b) => a.fit.name.localeCompare(b.fit.name))
            .map((fit) => {
              index += 1;

              let icon: IconName | undefined;
              let iconTitle: string | undefined;
              switch (fit.origin) {
                case "local":
                  icon = "fitting-local";
                  iconTitle = "Browser-stored fitting";
                  break;

                case "character":
                  icon = "fitting-character";
                  iconTitle = "In-game personal fitting";
                  break;
              }

              return (
                <TreeLeaf
                  key={`${fit.fit.ship_type_id}-${index}`}
                  level={4}
                  content={fit.fit.name}
                  onClick={() => fitManager.setFit(fit.fit)}
                  icon={icon}
                  iconTitle={iconTitle}
                />
              );
            })}
        </>
      );
    }
  }, [fitManager, props.entry]);

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      fitManager.createNewFit(props.typeId);
    },
    [fitManager, props.typeId],
  );

  const headerAction = <TreeHeaderAction icon="simulate" onClick={onClick} />;
  const header = (
    <TreeHeader
      icon={`https://images.evetech.net/types/${props.typeId}/icon?size=32`}
      text={props.entry.name}
      action={headerAction}
    />
  );
  return <TreeListing level={3} header={header} height={32} getChildren={getChildren} />;
};

const HullRace = (props: { raceId: number; entries: ListingHulls }) => {
  const getChildren = React.useCallback(() => {
    return (
      <>
        {Object.keys(props.entries)
          .sort((a, b) => props.entries[a].name.localeCompare(props.entries[b].name))
          .map((typeId) => {
            const entry = props.entries[typeId];
            return <Hull key={typeId} typeId={parseInt(typeId)} entry={entry} />;
          })}
      </>
    );
  }, [props.entries]);

  if (props.entries === undefined) return null;

  const header = (
    <TreeHeader
      icon={`https://images.evetech.net/corporations/${props.raceId}/logo?size=32`}
      text={`${factionIdToRace[props.raceId]} [${Object.keys(props.entries).length}]`}
    />
  );
  return <TreeListing level={2} header={header} getChildren={getChildren} />;
};

const HullGroup = (props: { name: string; entries: ListingGroup }) => {
  const getChildren = React.useCallback(() => {
    return (
      <>
        <HullRace raceId={500003} entries={props.entries.Amarr} />
        <HullRace raceId={500001} entries={props.entries.Caldari} />
        <HullRace raceId={500004} entries={props.entries.Gallente} />
        <HullRace raceId={500002} entries={props.entries.Minmatar} />
        <HullRace raceId={1} entries={props.entries.NonEmpire} />
      </>
    );
  }, [props.entries]);

  const header = <TreeHeader text={`${props.name}`} />;
  return <TreeListing level={1} header={header} getChildren={getChildren} />;
};

/**
 * Show all the fittings for the current ESI character.
 */
export const HullListing = () => {
  const eveData = useEveData();
  const currentFit = useCurrentFit();
  const currentCharacter = useCurrentCharacter();
  const localFits = useLocalFits();

  const [search, setSearch] = React.useState<string>("");
  const [filter, setFilter] = React.useState({
    localFits: false,
    characterFits: false,
    currentHull: false,
  });

  const localFitsGrouped = React.useMemo(() => {
    const grouped: Record<string, ListingFit[]> = {};
    for (const fit of localFits.fittings) {
      if (fit.ship_type_id === undefined) continue;

      if (grouped[fit.ship_type_id] === undefined) {
        grouped[fit.ship_type_id] = [];
      }

      grouped[fit.ship_type_id].push({
        origin: "local",
        fit,
      });
    }

    return grouped;
  }, [localFits]);

  const characterFitsGrouped = React.useMemo(() => {
    const characterFittings = currentCharacter.character?.fittings ?? [];

    const grouped: Record<string, ListingFit[]> = {};
    for (const fit of characterFittings) {
      if (fit.ship_type_id === undefined) continue;

      if (grouped[fit.ship_type_id] === undefined) {
        grouped[fit.ship_type_id] = [];
      }

      grouped[fit.ship_type_id].push({
        origin: "character",
        fit,
      });
    }

    return grouped;
  }, [currentCharacter.character?.fittings]);

  const hullGrouped = React.useMemo(() => {
    if (eveData === null) return {};

    const anyFilter = filter.localFits || filter.characterFits;

    const grouped: ListingGroups = {};
    for (const typeId in eveData.typeIDs) {
      const hull = eveData.typeIDs[typeId];
      if (hull.categoryID !== 6) continue;
      if (hull.marketGroupID === undefined) continue;
      if (!hull.published) continue;

      if (filter.currentHull && currentFit.fit?.ship_type_id !== parseInt(typeId)) continue;

      const fits: ListingFit[] = [];
      if (anyFilter) {
        if (filter.localFits && Object.keys(localFitsGrouped).includes(typeId)) fits.push(...localFitsGrouped[typeId]);
        if (filter.characterFits && Object.keys(characterFitsGrouped).includes(typeId))
          fits.push(...characterFitsGrouped[typeId]);
        if (fits.length == 0) {
          if (!filter.currentHull || currentFit.fit?.ship_type_id !== parseInt(typeId)) continue;
        }
      } else {
        if (Object.keys(localFitsGrouped).includes(typeId)) fits.push(...localFitsGrouped[typeId]);
        if (Object.keys(characterFitsGrouped).includes(typeId)) fits.push(...characterFitsGrouped[typeId]);
      }

      if (search !== "" && !hull.name.toLowerCase().includes(search.toLowerCase())) continue;

      const group = eveData.groupIDs[hull.groupID]?.name ?? "Unknown Group";
      const race = factionIdToRace[hull.factionID ?? 0] ?? "NonEmpire";

      if (grouped[group] === undefined) {
        grouped[group] = {};
      }
      if (grouped[group][race] === undefined) {
        grouped[group][race] = {};
      }

      grouped[group][race][typeId] = {
        name: hull.name,
        fits,
      };
    }

    return grouped;
  }, [eveData, search, filter, localFitsGrouped, characterFitsGrouped, currentFit]);

  return (
    <div className={styles.listing}>
      <div className={styles.topbar}>
        <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className={styles.filter}>
        <span
          className={clsx({ [styles.selected]: filter.localFits })}
          onClick={() => setFilter({ ...filter, localFits: !filter.localFits })}
        >
          <Icon name="fitting-local" size={32} title="Filter: Browser-stored fittings" />
        </span>
        <span
          className={clsx({ [styles.selected]: filter.characterFits })}
          onClick={() => setFilter({ ...filter, characterFits: !filter.characterFits })}
        >
          <Icon name="fitting-character" size={32} title="Filter: in-game personal fittings" />
        </span>
        <span className={styles.disabled}>
          <Icon name="fitting-corporation" size={32} title="CCP didn't implement this ESI endpoint (yet?)" />
        </span>
        <span className={styles.disabled}>
          <Icon name="fitting-alliance" size={32} title="CCP didn't implement this ESI endpoint (yet?)" />
        </span>
        <span
          className={clsx({ [styles.selected]: filter.currentHull })}
          onClick={() => setFilter({ ...filter, currentHull: !filter.currentHull })}
        >
          <Icon name="fitting-hull" size={32} title="Filter: current hull" />
        </span>
      </div>
      <div className={styles.listingContent}>
        {Object.keys(hullGrouped)
          .sort()
          .map((groupName) => {
            const groupData = hullGrouped[groupName];
            return <HullGroup key={groupName} name={groupName} entries={groupData} />;
          })}
      </div>
    </div>
  );
};
