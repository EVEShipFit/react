import { EsfSlot } from "@/providers/CurrentFitProvider";

export interface EsiSlot {
  type: "Module" | "CargoBay" | "DroneBay";
  module?: EsfSlot;
}

const esiFlagIdToName: Record<number, string> = {
  5: "Cargo",
  11: "LoSlot0",
  12: "LoSlot1",
  13: "LoSlot2",
  14: "LoSlot3",
  15: "LoSlot4",
  16: "LoSlot5",
  17: "LoSlot6",
  18: "LoSlot7",
  19: "MedSlot0",
  20: "MedSlot1",
  21: "MedSlot2",
  22: "MedSlot3",
  23: "MedSlot4",
  24: "MedSlot5",
  25: "MedSlot6",
  26: "MedSlot7",
  27: "HiSlot0",
  28: "HiSlot1",
  29: "HiSlot2",
  30: "HiSlot3",
  31: "HiSlot4",
  32: "HiSlot5",
  33: "HiSlot6",
  34: "HiSlot7",
  87: "DroneBay",
  92: "RigSlot0",
  93: "RigSlot1",
  94: "RigSlot2",
  125: "SubSystemSlot0",
  126: "SubSystemSlot1",
  127: "SubSystemSlot2",
  128: "SubSystemSlot3",
};

const esiFlagNameToEsiSlot: Record<string, EsiSlot> = {
  Cargo: { type: "CargoBay" },
  LoSlot0: { type: "Module", module: { type: "Low", index: 1 } },
  LoSlot1: { type: "Module", module: { type: "Low", index: 2 } },
  LoSlot2: { type: "Module", module: { type: "Low", index: 3 } },
  LoSlot3: { type: "Module", module: { type: "Low", index: 4 } },
  LoSlot4: { type: "Module", module: { type: "Low", index: 5 } },
  LoSlot5: { type: "Module", module: { type: "Low", index: 6 } },
  LoSlot6: { type: "Module", module: { type: "Low", index: 7 } },
  LoSlot7: { type: "Module", module: { type: "Low", index: 8 } },
  MedSlot0: { type: "Module", module: { type: "Medium", index: 1 } },
  MedSlot1: { type: "Module", module: { type: "Medium", index: 2 } },
  MedSlot2: { type: "Module", module: { type: "Medium", index: 3 } },
  MedSlot3: { type: "Module", module: { type: "Medium", index: 4 } },
  MedSlot4: { type: "Module", module: { type: "Medium", index: 5 } },
  MedSlot5: { type: "Module", module: { type: "Medium", index: 6 } },
  MedSlot6: { type: "Module", module: { type: "Medium", index: 7 } },
  MedSlot7: { type: "Module", module: { type: "Medium", index: 8 } },
  HiSlot0: { type: "Module", module: { type: "High", index: 1 } },
  HiSlot1: { type: "Module", module: { type: "High", index: 2 } },
  HiSlot2: { type: "Module", module: { type: "High", index: 3 } },
  HiSlot3: { type: "Module", module: { type: "High", index: 4 } },
  HiSlot4: { type: "Module", module: { type: "High", index: 5 } },
  HiSlot5: { type: "Module", module: { type: "High", index: 6 } },
  HiSlot6: { type: "Module", module: { type: "High", index: 7 } },
  HiSlot7: { type: "Module", module: { type: "High", index: 8 } },
  DroneBay: { type: "DroneBay" },
  RigSlot0: { type: "Module", module: { type: "Rig", index: 1 } },
  RigSlot1: { type: "Module", module: { type: "Rig", index: 2 } },
  RigSlot2: { type: "Module", module: { type: "Rig", index: 3 } },
  SubSystemSlot0: { type: "Module", module: { type: "SubSystem", index: 1 } },
  SubSystemSlot1: { type: "Module", module: { type: "SubSystem", index: 2 } },
  SubSystemSlot2: { type: "Module", module: { type: "SubSystem", index: 3 } },
  SubSystemSlot3: { type: "Module", module: { type: "SubSystem", index: 4 } },
};

export const esiFlagToEsiSlot = (flag: number | string): EsiSlot | undefined => {
  if (typeof flag === "number") {
    flag = esiFlagIdToName[flag];
  }

  return esiFlagNameToEsiSlot[flag];
};
