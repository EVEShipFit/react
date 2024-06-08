import { EsfCargo, EsfDrone, EsfFit, EsfModule, EsfState } from "@/providers/CurrentFitProvider";

import { decompress } from "./Decompress";
import { esiFlagToEsfSlot } from "./EsiFlags";

export async function decodeEsfFitV2(fitCompressed: string): Promise<EsfFit | null> {
  const fitEncoded = await decompress(fitCompressed);

  const fitLines = fitEncoded.trim().split("\n");
  const fitHeader = fitLines[0].split(",");

  const modules = fitLines
    .slice(1)
    .map((line): EsfModule | undefined => {
      const item = line.split(",");
      const flag = parseInt(item[0]);
      if (esiFlagToEsfSlot[flag] === undefined) return undefined; // Skip anything not modules.

      let charge = undefined;
      if (item[3]) {
        charge = {
          typeId: parseInt(item[3]),
        };
      }

      return {
        slot: esiFlagToEsfSlot[flag],
        typeId: parseInt(item[1]),
        charge,
        state: (item[4] as EsfState) || "Active",
      };
    })
    .filter((item): item is EsfModule => item !== undefined);

  const drones = fitLines
    .slice(1)
    .map((line): EsfDrone | undefined => {
      const item = line.split(",");
      const flag = parseInt(item[0]);
      if (flag != 87) return undefined; // Skip anything not drones.

      const quantity = parseInt(item[2]);

      return {
        typeId: parseInt(item[1]),
        states: {
          Active: item[4] !== "Passive" ? quantity : 0,
          Passive: item[4] === "Passive" ? quantity : 0,
        },
      };
    })
    .filter((item): item is EsfDrone => item !== undefined);
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

  const cargo = fitLines
    .slice(1)
    .map((line): EsfCargo | undefined => {
      const item = line.split(",");
      const flag = parseInt(item[0]);
      if (flag != 5) return undefined; // Skip anything not cargo.

      return {
        typeId: parseInt(item[1]),
        quantity: parseInt(item[2]),
      };
    })
    .filter((item): item is EsfCargo => item !== undefined);

  return {
    shipTypeId: parseInt(fitHeader[0]),
    name: fitHeader[1],
    description: fitHeader[2],
    modules,
    drones: Array.from(droneMap.values()),
    cargo,
  };
}
