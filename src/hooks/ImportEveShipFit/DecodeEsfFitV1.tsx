import { EsfCargo, EsfDrone, EsfFit, EsfModule } from "@/providers/CurrentFitProvider";
import { esiFlagToEsiSlot } from "@/hooks/ImportEsiFitting";

import { decompress } from "./Decompress";

export async function decodeEsfFitV1(fitCompressed: string): Promise<EsfFit | null> {
  const fitEncoded = await decompress(fitCompressed);

  const fitLines = fitEncoded.trim().split("\n");
  const fitHeader = fitLines[0].split(",");

  const modules = fitLines
    .slice(1)
    .map((line): EsfModule | undefined => {
      const item = line.split(",");
      const flag = parseInt(item[0]);
      const slot = esiFlagToEsiSlot(flag);
      if (slot === undefined || slot.type !== "Module") return undefined; // Skip anything not modules.

      return {
        slot: slot.module!,
        typeId: parseInt(item[1]),
        state: "Active",
      };
    })
    .filter((item): item is EsfModule => item !== undefined);

  const drones = fitLines
    .slice(1)
    .map((line): EsfDrone | undefined => {
      const item = line.split(",");
      const flag = parseInt(item[0]);
      const slot = esiFlagToEsiSlot(flag);
      if (slot === undefined || slot.type !== "DroneBay") return undefined; // Skip anything not drones.

      return {
        typeId: parseInt(item[1]),
        states: {
          Active: parseInt(item[2]),
          Passive: 0,
        },
      };
    })
    .filter((item): item is EsfDrone => item !== undefined);

  const cargo = fitLines
    .slice(1)
    .map((line): EsfCargo | undefined => {
      const item = line.split(",");
      const flag = parseInt(item[0]);
      const slot = esiFlagToEsiSlot(flag);
      if (slot === undefined || slot.type !== "CargoBay") return undefined; // Skip anything not cargo.

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
    drones,
    cargo,
  };
}
