import clsx from "clsx";
import React from "react";

import { defaultDataUrl } from "@/settings";
import { Icon } from "@/components/Icon";
import { TreeListing, TreeHeader, TreeLeaf } from "@/components/TreeListing";
import { useCurrentStatistics } from "@/providers/StatisticsProvider";
import { useFitManager } from "@/providers/FitManagerProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { CalculationSlotType } from "@/providers/DogmaEngineProvider";

import styles from "./HardwareListing.module.css";

interface ModuleCharge {
  typeId: number;
  name: string;
  chargeGroupIDs: number[];
  chargeSize: number;
}

interface ListingItem {
  name: string;
  meta: number;
  typeId: number;
  slotType: CalculationSlotType;
}

interface ListingGroup {
  name: string;
  meta: number;
  iconID?: number;
  groups: Record<string, ListingGroup>;
  items: ListingItem[];
}

interface Filter {
  lowslot: boolean;
  medslot: boolean;
  hislot: boolean;
  rigSubsystem: boolean;
  drone: boolean;
  hullRestriction: boolean;
  moduleWithCharge: ModuleCharge | undefined;
}

const OnItemDragStart = (
  typeId: number,
  slotType: CalculationSlotType,
): ((e: React.DragEvent<HTMLDivElement>) => void) => {
  return (e: React.DragEvent<HTMLDivElement>) => {
    const img = new Image();
    img.src = `https://images.evetech.net/types/${typeId}/icon?size=64`;
    e.dataTransfer.setDragImage(img, 32, 32);
    e.dataTransfer.setData("application/esf-type-id", typeId.toString());
    e.dataTransfer.setData("application/esf-slot-type", slotType);
  };
};

const ModuleGroup = (props: { level: number; group: ListingGroup; hideGroup?: boolean }) => {
  const fitManager = useFitManager();

  const PreviewStart = React.useCallback(
    (typeId: number, slotType: CalculationSlotType): void => {
      if (slotType === "DroneBay") return;
      fitManager.addItem(typeId, slotType, true);
    },
    [fitManager],
  );

  const PreviewEnd = React.useCallback((): void => {
    fitManager.removePreview();
  }, [fitManager]);

  const getChildren = React.useCallback(() => {
    return (
      <>
        {Object.values(props.group.items)
          .sort((a, b) => a.meta - b.meta || a.name.localeCompare(b.name))
          .map((item) => {
            const slotType = item.slotType;
            return (
              <TreeLeaf
                key={item.typeId}
                level={2}
                content={item.name}
                onDoubleClick={() => {
                  PreviewEnd();
                  fitManager.addItem(item.typeId, slotType);
                }}
                onDragStart={OnItemDragStart(item.typeId, slotType)}
                onMouseEnter={() => PreviewStart(item.typeId, slotType)}
                onMouseLeave={() => PreviewEnd()}
              />
            );
          })}
        {Object.keys(props.group.groups)
          .sort(
            (a, b) =>
              props.group.groups[a].meta - props.group.groups[b].meta ||
              props.group.groups[a].name.localeCompare(props.group.groups[b].name),
          )
          .map((groupId) => {
            return <ModuleGroup key={groupId} level={props.level + 1} group={props.group.groups[groupId]} />;
          })}
      </>
    );
  }, [fitManager, props.group, props.level, PreviewStart, PreviewEnd]);

  if (props.hideGroup) {
    return <TreeListing level={props.level} getChildren={getChildren} />;
  }

  const header = (
    <TreeHeader
      icon={props.group.iconID === undefined ? "" : `${defaultDataUrl}icons/${props.group.iconID}.png`}
      text={props.group.name}
    />
  );
  return <TreeListing level={props.level} header={header} getChildren={getChildren} />;
};

/**
 * Show all the modules you can fit to a ship.
 */
export const HardwareListing = () => {
  const eveData = useEveData();
  const statistics = useCurrentStatistics();

  const [search, setSearch] = React.useState<string>("");
  const [filter, setFilter] = React.useState<Filter>({
    lowslot: false,
    medslot: false,
    hislot: false,
    rigSubsystem: false,
    drone: false,
    hullRestriction: false,
    moduleWithCharge: undefined,
  });
  const [selection, setSelection] = React.useState<"modules" | "charges">("modules");

  const modulesWithCharges = React.useMemo(() => {
    if (eveData === null || statistics === null) return [];

    /* Iterate all items to check if they have a charge. */
    const modules: ModuleCharge[] = [];
    const seenModules = new Set<number>();
    for (const item of statistics.items) {
      const chargeGroup1 = item.attributes.get(eveData?.attributeMapping.chargeGroup1 ?? 0)?.value;
      const chargeGroup2 = item.attributes.get(eveData?.attributeMapping.chargeGroup2 ?? 0)?.value;
      const chargeGroup3 = item.attributes.get(eveData?.attributeMapping.chargeGroup3 ?? 0)?.value;
      const chargeGroup4 = item.attributes.get(eveData?.attributeMapping.chargeGroup4 ?? 0)?.value;
      const chargeGroup5 = item.attributes.get(eveData?.attributeMapping.chargeGroup5 ?? 0)?.value;

      const chargeGroupIDs: number[] = [chargeGroup1, chargeGroup2, chargeGroup3, chargeGroup4, chargeGroup5].filter(
        (x): x is number => x !== undefined,
      );

      if (chargeGroupIDs.length === 0) continue;
      if (seenModules.has(item.type_id)) continue;
      seenModules.add(item.type_id);

      modules.push({
        typeId: item.type_id,
        name: eveData?.types?.[item.type_id].name ?? "Unknown",
        chargeGroupIDs,
        chargeSize: item.attributes.get(eveData?.attributeMapping.chargeSize ?? 0)?.value ?? -1,
      });
    }

    return modules;
  }, [eveData, statistics]);

  const { charges, modules } = React.useMemo(() => {
    if (eveData === null)
      return {
        charges: {} as ListingGroup,
        modules: {} as ListingGroup,
      };

    const newModuleGroups: ListingGroup = {
      name: "Modules",
      meta: 0,
      groups: {},
      items: [],
    };
    const newChargeGroups: ListingGroup = {
      name: "Charges",
      meta: 0,
      groups: {},
      items: [],
    };

    for (const typeId in eveData.types) {
      const module = eveData.types[typeId];
      /* Modules (7), Charges (8), Drones (18), Subsystems (32), and Structures (66) */
      if (
        module.categoryID !== 7 &&
        module.categoryID !== 8 &&
        module.categoryID !== 18 &&
        module.categoryID !== 32 &&
        module.categoryID !== 66
      ) {
        continue;
      }
      if (module.marketGroupID === undefined) continue;
      if (!module.published) continue;

      let slotType: CalculationSlotType | undefined;
      if (module.categoryID !== 8) {
        slotType = eveData.typeDogma[typeId]?.dogmaEffects
          .map((effect) => {
            switch (effect.effectID) {
              case eveData.effectMapping.loPower:
                return "Low";
              case eveData.effectMapping.medPower:
                return "Medium";
              case eveData.effectMapping.hiPower:
                return "High";
              case eveData.effectMapping.rigSlot:
                return "Rig";
              case eveData.effectMapping.subSystem:
                return "SubSystem";
            }
          })
          .filter((slot) => slot !== undefined)[0];
        if (module.categoryID === 18) {
          slotType = "DroneBay";
        }

        if (slotType === undefined) continue;

        if (filter.lowslot || filter.medslot || filter.hislot || filter.rigSubsystem || filter.drone) {
          if (slotType === "Low" && !filter.lowslot) continue;
          if (slotType === "Medium" && !filter.medslot) continue;
          if (slotType === "High" && !filter.hislot) continue;
          if ((slotType === "Rig" || slotType === "SubSystem") && !filter.rigSubsystem) continue;
          if (module.categoryID === 18 && !filter.drone) continue;
        }

        if (filter.hullRestriction && statistics !== null) {
          const shipType = statistics.hull.type_id;

          if (slotType === "Rig") {
            const attributeRigSize = eveData.attributeMapping.rigSize;
            const moduleRigSize = eveData.typeDogma[typeId]?.dogmaAttributes.find(
              (attr) => attr.attributeID === attributeRigSize,
            )?.value;
            const shipRigSize = statistics.hull.attributes.get(attributeRigSize)?.value;

            if (moduleRigSize !== shipRigSize) continue;
          } else if (slotType === "DroneBay") {
            if (statistics.hull.attributes.get(eveData.attributeMapping.droneBandwidth)?.value === 0) continue;
          } else {
            if (slotType === "Low" && statistics.slots.Low === 0) continue;
            if (slotType === "Medium" && statistics.slots.Medium === 0) continue;
            if (slotType === "High" && statistics.slots.High === 0) continue;
            if (slotType === "SubSystem" && statistics.slots.SubSystem === 0) continue;

            const volume = module.volume ?? 0;
            if (volume >= 3500) {
              /* Modules with a volume of 3500 are considered capitals. */
              const isCapitalSize = eveData.typeDogma[shipType]?.dogmaAttributes.find(
                (attr) => attr.attributeID === eveData.attributeMapping.isCapitalSize,
              )?.value;

              if (isCapitalSize === undefined || isCapitalSize === 0) continue;
            }
          }

          const shipGroup = eveData.types[shipType]?.groupID;

          const canFitShipType = eveData.typeDogma[typeId]?.dogmaAttributes.filter(
            (attr) =>
              attr.attributeID === eveData.attributeMapping.fitsToShipType ||
              attr.attributeID === eveData.attributeMapping.canFitShipType1 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType2 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType3 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType4 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType5 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType6 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType7 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType8 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType9 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType10 ||
              attr.attributeID === eveData.attributeMapping.canFitShipType11,
          );
          const canFitShipGroup = eveData.typeDogma[typeId]?.dogmaAttributes.filter(
            (attr) =>
              attr.attributeID === eveData.attributeMapping.canFitShipGroup01 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup02 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup03 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup04 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup05 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup06 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup07 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup08 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup09 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup10 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup11 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup12 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup13 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup14 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup15 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup16 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup17 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup18 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup19 ||
              attr.attributeID === eveData.attributeMapping.canFitShipGroup20,
          );

          /* If there is a fit restriction, check if this ship matches. */
          if (canFitShipType.length > 0 || canFitShipGroup.length > 0) {
            const fitGroup = canFitShipGroup.find((attr) => attr.value === shipGroup);
            const fitType = canFitShipType.find((attr) => attr.value === shipType);

            if (fitGroup === undefined && fitType === undefined) continue;
          }
        }
      } else {
        if (filter.moduleWithCharge !== undefined) {
          /* If the module has size restrictions, ensure the charge matches. */
          const chargeSize =
            eveData.typeDogma[typeId]?.dogmaAttributes.find(
              (attr) => attr.attributeID === eveData.attributeMapping.chargeSize,
            )?.value ?? -1;
          if (filter.moduleWithCharge.chargeSize !== -1 && chargeSize !== filter.moduleWithCharge.chargeSize) continue;

          for (const chargeGroupID of filter.moduleWithCharge.chargeGroupIDs) {
            if (module.groupID !== chargeGroupID) continue;

            slotType = "Charge";
            break;
          }

          if (slotType === undefined) continue;
        } else {
          slotType = "Charge";
        }
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
        marketGroup = eveData.marketGroups[marketGroup].parentGroupID;
      }

      /* Remove the root group. */
      marketGroups.pop();
      /* Put Drones and Structures in their own group. */
      if (module.categoryID === 18) marketGroups.push(157);
      if (module.categoryID === 66) marketGroups.push(477);

      /* Build up the tree till the find the leaf node. */
      let groupTree = module.categoryID === 8 ? newChargeGroups : newModuleGroups;
      for (const group of marketGroups.reverse()) {
        if (module.categoryID === 8 && filter.moduleWithCharge !== undefined && group >= 0) {
          continue;
        }

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
              name = eveData.marketGroups[group].name ?? "Unknown group";
              meta = 1;
              iconID = eveData.marketGroups[group].iconID;
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

    return {
      charges: newChargeGroups,
      modules: newModuleGroups,
    };
  }, [eveData, search, filter, statistics]);

  /* If the moduleWithCharge filter was set, validate if it is still valid. */
  if (
    filter.moduleWithCharge !== undefined &&
    modulesWithCharges.find((charge) => charge.typeId === filter.moduleWithCharge?.typeId) === undefined
  ) {
    setFilter({
      ...filter,
      moduleWithCharge: undefined,
    });
  }

  return (
    <div className={styles.listing}>
      <div className={styles.topbar}>
        <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className={clsx(styles.filter, { [styles.collapsed]: selection !== "modules" })}>
        <span
          className={clsx({ [styles.selected]: filter.lowslot })}
          onClick={() => setFilter({ ...filter, lowslot: !filter.lowslot })}
        >
          <Icon name="fitting-lowslot" size={32} title="Filter: Low Slot" />
        </span>
        <span
          className={clsx({ [styles.selected]: filter.medslot })}
          onClick={() => setFilter({ ...filter, medslot: !filter.medslot })}
        >
          <Icon name="fitting-medslot" size={32} title="Filter: Mid Slot" />
        </span>
        <span
          className={clsx({ [styles.selected]: filter.hislot })}
          onClick={() => setFilter({ ...filter, hislot: !filter.hislot })}
        >
          <Icon name="fitting-hislot" size={32} title="Filter: High Slot" />
        </span>
        <span
          className={clsx({ [styles.selected]: filter.rigSubsystem })}
          onClick={() => setFilter({ ...filter, rigSubsystem: !filter.rigSubsystem })}
        >
          <Icon name="fitting-rig-subsystem" size={32} title="Filter: Rig & Subsystem Slots" />
        </span>
        <span
          className={clsx({ [styles.selected]: filter.drone })}
          onClick={() => setFilter({ ...filter, drone: !filter.drone })}
        >
          <Icon name="fitting-drones" size={32} title="Filter: Drones" />
        </span>
        <span
          className={clsx({ [styles.selected]: filter.hullRestriction })}
          onClick={() => setFilter({ ...filter, hullRestriction: !filter.hullRestriction })}
        >
          <Icon name="fitting-hull-restriction" size={32} title="Filter: Hull Restrictions" />
        </span>
      </div>
      <div className={clsx(styles.filter, { [styles.collapsed]: selection !== "charges" })}>
        {Object.values(modulesWithCharges)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((chargeGroup) => {
            return (
              <span
                key={chargeGroup.typeId}
                className={clsx({ [styles.selected]: filter.moduleWithCharge?.typeId === chargeGroup.typeId })}
                onClick={() =>
                  setFilter({
                    ...filter,
                    moduleWithCharge: filter.moduleWithCharge?.typeId === chargeGroup.typeId ? undefined : chargeGroup,
                  })
                }
              >
                <img
                  src={`https://images.evetech.net/types/${chargeGroup.typeId}/icon?size=64`}
                  height={32}
                  width={32}
                  alt=""
                  className={styles.moduleChargeIcon}
                  title={chargeGroup.name}
                />
              </span>
            );
          })}
      </div>
      <div className={styles.selectionHeader}>
        <div onClick={() => setSelection("modules")} className={clsx({ [styles.selected]: selection === "modules" })}>
          Modules
        </div>
        <div onClick={() => setSelection("charges")} className={clsx({ [styles.selected]: selection === "charges" })}>
          Charges
        </div>
      </div>
      <div className={clsx(styles.listingContent, { [styles.collapsed]: selection !== "modules" })}>
        <ModuleGroup key="modules" level={0} group={modules} hideGroup={true} />
      </div>
      <div className={clsx(styles.listingContent, { [styles.collapsed]: selection !== "charges" })}>
        <ModuleGroup key="charges" level={0} group={charges} hideGroup={true} />
      </div>
    </div>
  );
};
