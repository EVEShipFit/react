import { esiFlagToEsiSlot } from "@/hooks/ImportEsiFitting";
import { EsfCargo, EsfDrone, EsfFit, EsfModule } from "../CurrentFitProvider/CurrentFitProvider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConvertV2 = (fit: any) => {
  const modules = fit.items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any): EsfModule | undefined => {
      const slot = esiFlagToEsiSlot(item.flag);
      if (slot === undefined || slot.type !== "Module") return undefined;

      return {
        typeId: item.type_id,
        slot: slot.module!,
        state: item.state ?? "Active",
        charge:
          item.charge === undefined
            ? undefined
            : {
                typeId: item.charge.type_id,
              },
      };
    })
    .filter((item: EsfModule | undefined) => item !== undefined) as EsfModule[];

  const drones = fit.items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any): EsfDrone | undefined => {
      const slot = esiFlagToEsiSlot(item.flag);
      if (slot === undefined || slot.type !== "DroneBay") return undefined;

      return {
        typeId: item.type_id,
        states: {
          Active: item.state !== "Passive" ? item.quantity : 0,
          Passive: item.state === "Passive" ? item.quantity : 0,
        },
      };
    })
    .filter((item: EsfDrone | undefined) => item !== undefined) as EsfDrone[];
  /* Drones can now be in the list twice, once for active and once for passive. Deduplicate. */
  const droneMap = new Map<number, EsfDrone>();
  drones.forEach((drone) => {
    if (droneMap.has(drone.typeId)) {
      droneMap.get(drone.typeId)!.states.Active += drone.states.Active;
      droneMap.get(drone.typeId)!.states.Passive += drone.states.Passive;
    } else {
      droneMap.set(drone.typeId, drone);
    }
  });

  const cargo = fit.items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any): EsfCargo | undefined => {
      const slot = esiFlagToEsiSlot(item.flag);
      if (slot === undefined || slot.type !== "CargoBay") return undefined;

      return {
        typeId: item.type_id,
        quantity: item.quantity,
      };
    })
    .filter((item: EsfCargo | undefined) => item !== undefined) as EsfCargo[];

  const newFit: EsfFit = {
    name: fit.name,
    shipTypeId: fit.ship_type_id,
    description: fit.description,
    modules,
    drones,
    cargo,
  };
  return newFit;
};
