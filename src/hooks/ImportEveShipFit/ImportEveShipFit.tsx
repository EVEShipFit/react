import React from "react";

import { EsfFit } from "@/providers/CurrentFitProvider";
import { useCleanImportFit } from "@/hooks/CleanImportFit";

import { decodeEsfFitV1 } from "./DecodeEsfFitV1";
import { decodeEsfFitV2 } from "./DecodeEsfFitV2";
import { decodeEsfFitV3 } from "./DecodeEsfFitV3";
import { useDecodeEft } from "./DecodeEft";
import { useFetchKillMail } from "./DecodeKillMail";

/**
 * Convert a encoded ESF fit to an ESF fit.
 */
export function useImportEveShipFit() {
  const fetchKillMail = useFetchKillMail();
  const decodeEft = useDecodeEft();
  const cleanImportFit = useCleanImportFit();

  return async (esfEncoded: string): Promise<EsfFit | undefined | null> => {
    const esfType = esfEncoded.split(":")[0];
    const fitEncoded = esfEncoded.split(":")[1];

    let fit = undefined;
    switch (esfType) {
      case "v1":
        fit = await decodeEsfFitV1(fitEncoded);
        break;
      case "v2":
        fit = await decodeEsfFitV2(fitEncoded);
        break;
      case "v3":
        fit = await decodeEsfFitV3(fitEncoded);
        break;
      case "killmail":
        fit = await fetchKillMail(fitEncoded);
        break;
      case "eft":
        fit = await decodeEft(fitEncoded);
        break;
    }

    if (fit !== null && fit !== undefined) {
      fit = cleanImportFit(fit);
    }

    return fit;
  };
}

export interface ImportEveShipFitProps {
  /** The encoded ESF value. */
  esfEncoded: string;
}

/**
 * `importEveShipFit` converts a encoded ESF to an ESF fit.
 *
 * Note: do not use this React component itself, but the importEveShipFit() function instead.
 */
export const ImportEveShipFit = (props: ImportEveShipFitProps) => {
  const importEveShipFit = useImportEveShipFit();
  const [fit, setFit] = React.useState<EsfFit | null | undefined>(undefined);

  const importEveShipFitRef = React.useRef(importEveShipFit);
  importEveShipFitRef.current = importEveShipFit;

  React.useEffect(() => {
    async function getFit(esfEncoded: string) {
      setFit(await importEveShipFitRef.current(esfEncoded));
    }

    getFit(props.esfEncoded);
  }, [props.esfEncoded]);

  if (props.esfEncoded === undefined) {
    return <div>Select a encoded ESF fit.</div>;
  }

  return (
    <div>
      Encoded: <pre>{props.esfEncoded}</pre>
      Fit: <pre>{JSON.stringify(fit, null, 2)}</pre>
    </div>
  );
};
