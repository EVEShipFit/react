import { EsfFit, EsfModule } from "@/providers/CurrentFitProvider";

import { decompress } from "./Decompress";
import { esiFlagToEsfSlot } from "./EsiFlags";

export async function decodeEsfFitV1(fitCompressed: string): Promise<EsfFit | null> {
  const fitEncoded = await decompress(fitCompressed);

  const fitLines = fitEncoded.trim().split("\n");
  const fitHeader = fitLines[0].split(",");

  const modules = fitLines.slice(1).map((line): EsfModule => {
    const item = line.split(",");
    return {
      slot: esiFlagToEsfSlot[parseInt(item[0])],
      typeId: parseInt(item[1]),
      state: "Active",
    };
  });

  return {
    shipTypeId: parseInt(fitHeader[0]),
    name: fitHeader[1],
    description: fitHeader[2],
    modules,
    drones: [], // v1 didn't store drones.
    cargo: [], // v2 didn't store cargo.
  };
}
