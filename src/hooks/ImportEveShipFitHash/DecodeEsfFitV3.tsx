import { EsfCargo, EsfDrone, EsfFit, EsfModule, EsfSlotType, EsfState } from "@/providers/CurrentFitProvider";

import { decompress } from "./Decompress";

export async function decodeEsfFitV3(fitCompressed: string): Promise<EsfFit | null> {
  const fitEncoded = await decompress(fitCompressed);

  const fitLines = fitEncoded.trim().split("\n");
  const fitHeader = fitLines[0].split(",");

  const modules = fitLines
    .slice(1)
    .map((line): EsfModule | undefined => {
      const item = line.split(",");
      const type = item[0];
      if (type !== "module") return undefined;

      return {
        slot: {
          type: item[1] as EsfSlotType,
          index: parseInt(item[2]),
        },
        typeId: parseInt(item[3]),
        state: item[4] as EsfState,
        charge: item[5] ? { typeId: parseInt(item[5]) } : undefined,
      };
    })
    .filter((item): item is EsfModule => item !== undefined);
  const drones = fitLines
    .slice(1)
    .map((line): EsfDrone | undefined => {
      const item = line.split(",");
      const type = item[0];
      if (type !== "drone") return undefined;

      return {
        typeId: parseInt(item[1]),
        states: {
          Active: parseInt(item[2]),
          Passive: parseInt(item[3]),
        },
      };
    })
    .filter((item): item is EsfDrone => item !== undefined);
  const cargo = fitLines
    .slice(1)
    .map((line): EsfCargo | undefined => {
      const item = line.split(",");
      const type = item[0];
      if (type !== "cargo") return undefined;

      return {
        typeId: parseInt(item[1]),
        quantity: parseInt(item[2]),
      };
    })
    .filter((item): item is EsfCargo => item !== undefined);

  return {
    shipTypeId: parseInt(fitHeader[1]),
    name: fitHeader[2],
    description: fitHeader[3],
    modules,
    drones,
    cargo,
  };
}
