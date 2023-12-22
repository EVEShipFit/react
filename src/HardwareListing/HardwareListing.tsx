import clsx from "clsx";
import React from "react";

import { defaultDataUrl } from "../settings";
import { EveDataContext } from "../EveDataProvider";
import { Icon } from "../Icon";
import { ShipSnapshotContext, ShipSnapshotSlotsType } from "../ShipSnapshotProvider";
import { TreeListing, TreeHeader, TreeLeaf } from "../TreeListing";

import styles from "./HardwareListing.module.css";

interface ListingItem {
  name: string;
  meta: number;
  typeId: number;
  slotType: ShipSnapshotSlotsType | "dronebay";
}

interface ListingGroup {
  name: string;
  meta: number;
  iconID?: number;
  groups: Record<string, ListingGroup>;
  items: ListingItem[];
}

const ModuleGroup = (props: { level: number, group: ListingGroup }) => {
  const shipSnapShot = React.useContext(ShipSnapshotContext);

  const getChildren = React.useCallback(() => {
    return <>
      {props.group.items.sort((a, b) => a.meta - b.meta || a.name.localeCompare(b.name)).map((item) => {
        return <TreeLeaf key={item.typeId} level={2} content={item.name} onClick={() => shipSnapShot.addModule(item.typeId, item.slotType)} />;
      })}
      {Object.keys(props.group.groups).sort((a, b) => props.group.groups[a].meta - props.group.groups[b].meta || props.group.groups[a].name.localeCompare(props.group.groups[b].name)).map((groupId) => {
        return <ModuleGroup key={groupId} level={props.level + 1} group={props.group.groups[groupId]} />
      })}
    </>;
  }, [props, shipSnapShot]);

  const header = <TreeHeader icon={props.group.iconID === undefined ? "" : `${defaultDataUrl}icons/${props.group.iconID}.png`} text={props.group.name} />;
  return <TreeListing level={props.level} header={header} getChildren={getChildren} />;
};

/**
 * Show all the modules you can fit to a ship.
 */
export const HardwareListing = () => {
  const eveData = React.useContext(EveDataContext);

  const [moduleGroups, setModuleGroups] = React.useState<ListingGroup>({
    name: "Modules",
    meta: 0,
    groups: {},
    items: [],
  });
  const [search, setSearch] = React.useState<string>("");
  const [filter, setFilter] = React.useState({
    lowslot: false,
    medslot: false,
    hislot: false,
    rig_subsystem: false,
    drone: false,
  });

  React.useEffect(() => {
    if (!eveData.loaded) return;

    const newModuleGroups: ListingGroup = {
      name: "Modules",
      meta: 0,
      groups: {},
      items: [],
    };

    for (const typeId in eveData.typeIDs) {
      const module = eveData.typeIDs[typeId];
      /* Modules (7), Drones (18), Subsystems (32), and Structures (66) */
      if (module.categoryID !== 7 && module.categoryID !== 18 && module.categoryID !== 32 && module.categoryID !== 66) continue;
      if (module.marketGroupID === undefined) continue;
      if (!module.published) continue;

      let slotType: ShipSnapshotSlotsType | "dronebay" | undefined = eveData.typeDogma?.[typeId]?.dogmaEffects.map((effect) => {
        switch (effect.effectID) {
          case 11: return "lowslot";
          case 13: return "medslot";
          case 12: return "hislot";
          case 2663: return "rig";
          case 3772: return "subsystem";
        }
      }).filter((slot) => slot !== undefined)[0];
      if (module.categoryID === 18) {
        slotType = "dronebay";
      }

      if (slotType === undefined) continue;

      if (filter.lowslot || filter.medslot || filter.hislot || filter.rig_subsystem || filter.drone) {
        if (slotType === "lowslot" && !filter.lowslot) continue;
        if (slotType === "medslot" && !filter.medslot) continue;
        if (slotType === "hislot" && !filter.hislot) continue;
        if ((slotType === "rig" || slotType === "subsystem") && !filter.rig_subsystem) continue;
        if (module.categoryID === 18 && !filter.drone) continue;
      }

      if (search !== "" && !module.name.toLowerCase().includes(search.toLowerCase())) continue;

      const marketGroups: number[] = [];

      switch (module.metaGroupID) {
        case 3: // Storyline
        case 4: // Faction
          marketGroups.push(-1);
          break;

        case 5: // Officer
          marketGroups.push(-2);
          break;

        case 6: // Deadspace
          marketGroups.push(-3);
          break;
      }

      /* Construct the tree of the module's market groups. */
      let marketGroup: number | undefined = module.marketGroupID;
      while (marketGroup !== undefined) {
        marketGroups.push(marketGroup);
        marketGroup = eveData.marketGroups?.[marketGroup].parentGroupID;
      }

      /* Remove the root group. */
      marketGroups.pop();
      /* Put Drones and Structures in their own group. */
      if (module.categoryID === 18) marketGroups.push(157);
      if (module.categoryID === 66) marketGroups.push(477);

      /* Build up the tree till the find the leaf node. */
      let groupTree = newModuleGroups;
      for (const group of marketGroups.reverse()) {
        if (groupTree.groups[group] === undefined) {
          let name;
          let meta;
          let iconID = undefined;
          switch (group) {
            case -1:
              name = "Faction & Storyline";
              iconID = 24146;
              meta = 3;
              break;

            case -2:
              name = "Officer";
              iconID = 24149;
              meta = 5;
              break;

            case -3:
              name = "Deadspace";
              iconID = 24148;
              meta = 6;
              break;

            default:
              name = eveData.marketGroups?.[group].name ?? "Unknown group";
              meta = 1;
              iconID = eveData.marketGroups?.[group].iconID;
              break;
          }

          groupTree.groups[group] = {
            name,
            meta,
            iconID,
            groups: {},
            items: [],
          };
        }

        groupTree = groupTree.groups[group];
      }

      groupTree.items.push({
        name: module.name,
        meta: module.metaGroupID ?? 0,
        typeId: parseInt(typeId),
        slotType,
      });
    }

    setModuleGroups(newModuleGroups);
  }, [eveData, search, filter]);

  return <div className={styles.listing}>
    <div className={styles.topbar}>
      <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
    <div className={styles.filter}>
      <span className={clsx({[styles.selected]: filter.lowslot})} onClick={() => setFilter({...filter, lowslot: !filter.lowslot})}>
        <Icon name="fitting-lowslot" size={32} title="Filter: Low Slot" />
      </span>
      <span className={clsx({[styles.selected]: filter.medslot})} onClick={() => setFilter({...filter, medslot: !filter.medslot})}>
        <Icon name="fitting-medslot" size={32} title="Filter: Mid Slot" />
      </span>
      <span className={clsx({[styles.selected]: filter.hislot})} onClick={() => setFilter({...filter, hislot: !filter.hislot})}>
        <Icon name="fitting-hislot" size={32} title="Filter: High Slot" />
      </span>
      <span className={clsx({[styles.selected]: filter.rig_subsystem})} onClick={() => setFilter({...filter, rig_subsystem: !filter.rig_subsystem})}>
        <Icon name="fitting-rig-subsystem" size={32} title="Filter: Rig & Subsystem Slots" />
      </span>
      <span className={clsx({[styles.selected]: filter.drone})} onClick={() => setFilter({...filter, drone: !filter.drone})}>
        <Icon name="fitting-drones" size={32} title="Filter: Drones" />
      </span>
    </div>
    <div className={styles.listingContent}>
      {Object.keys(moduleGroups.groups).sort((a, b) => moduleGroups.groups[a].name.localeCompare(moduleGroups.groups[b].name)).map((groupId) => {
        return <ModuleGroup key={groupId} level={1} group={moduleGroups.groups[groupId]} />
      })}
    </div>
  </div>
};
