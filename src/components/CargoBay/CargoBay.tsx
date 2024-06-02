import React from "react";

import { useFitManager } from "@/providers/FitManagerProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { EsfCargo, useCurrentFit } from "@/providers/CurrentFitProvider";
import { CalculationSlotType } from "@/providers/DogmaEngineProvider";

import styles from "./CargoBay.module.css";

const OnItemDragStart = (
  typeId: number,
  slotType?: CalculationSlotType,
): ((e: React.DragEvent<HTMLDivElement>) => void) => {
  return (e: React.DragEvent<HTMLDivElement>) => {
    const img = new Image();
    img.src = `https://images.evetech.net/types/${typeId}/icon?size=64`;
    e.dataTransfer.setDragImage(img, 32, 32);
    e.dataTransfer.setData("application/esf-type-id", typeId.toString());
    if (slotType !== undefined) {
      e.dataTransfer.setData("application/esf-slot-type", slotType);
    }
  };
};

const CargoBayEntry = ({ name, cargo }: { name: string; cargo: EsfCargo }) => {
  const eveData = useEveData();
  const fitManager = useFitManager();

  const onRemove = React.useCallback(() => {
    fitManager.removeCargo(cargo.typeId);
  }, [fitManager, cargo]);

  let slotType: CalculationSlotType | undefined = undefined;
  if (eveData?.typeIDs[cargo.typeId]?.categoryID === 18) {
    slotType = "DroneBay";
  } else if (eveData?.typeIDs[cargo.typeId]?.categoryID === 8) {
    slotType = "Charge";
  } else {
    slotType = eveData?.typeDogma[cargo.typeId]?.dogmaEffects
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
  }

  return (
    <div className={styles.cargoBayEntry} onDragStart={OnItemDragStart(cargo.typeId, slotType)} draggable>
      <div className={styles.amount}>{cargo.quantity} x</div>
      <div>
        <img src={`https://images.evetech.net/types/${cargo.typeId}/icon?size=32`} />
      </div>
      <div className={styles.middle}>
        <div className={styles.name}>{name}</div>
      </div>
      <div className={styles.close} onClick={onRemove}>
        X
      </div>
    </div>
  );
};

export const CargoBay = () => {
  const eveData = useEveData();
  const currentFit = useCurrentFit();

  if (eveData === null || currentFit?.fit === null) return <></>;

  /* Fetch name of all cargo items. */
  const cargoList: { name: string; item: EsfCargo }[] = [];
  for (const item of currentFit.fit.cargo) {
    const name = eveData.typeIDs?.[item.typeId].name ?? "";

    cargoList.push({
      name,
      item,
    });
  }

  return (
    <div className={styles.cargoBay}>
      {Object.values(cargoList)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ name, item }) => {
          return <CargoBayEntry key={name} name={name} cargo={item} />;
        })}
    </div>
  );
};
