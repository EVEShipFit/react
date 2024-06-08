import { useImportEft } from "@/hooks/ImportEft";
import { EsfFit } from "@/providers/CurrentFitProvider";

import { decompress } from "./Decompress";

export function useDecodeEft() {
  const importEft = useImportEft();

  return async (eftCompressed: string): Promise<EsfFit | null> => {
    const eft = await decompress(eftCompressed);
    return importEft(eft);
  };
}
