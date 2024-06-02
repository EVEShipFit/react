import React from "react";

import { EsfFit } from "@/providers/CurrentFitProvider";
import { useCleanImportFit } from "@/hooks/CleanImportFit";

import { decodeEsfFitV1 } from "./DecodeEsfFitV1";
import { decodeEsfFitV2 } from "./DecodeEsfFitV2";
import { decodeEsfFitV3 } from "./DecodeEsfFitV3";
import { useDecodeEft } from "./DecodeEft";
import { useFetchKillMail } from "./DecodeKillMail";

/**
 * Convert a hash from window.location.hash to an ESI fit.
 */
export function useImportEveShipFitHash() {
  const fetchKillMail = useFetchKillMail();
  const decodeEft = useDecodeEft();
  const cleanImportFit = useCleanImportFit();

  return async (fitHash: string): Promise<EsfFit | undefined | null> => {
    const fitPrefix = fitHash.split(":")[0];
    const fitVersion = fitHash.split(":")[1];
    const fitEncoded = fitHash.split(":")[2];

    if (fitPrefix !== "fit") return null;

    let fit = undefined;
    switch (fitVersion) {
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

export interface ImportEveShipFitHashProps {
  /** The hash of the fit string. */
  fitHash: string;
}

/**
 * `importEveShipFitHash` converts a hash from window.location.hash to an ESF fit.
 *
 * Note: do not use this React component itself, but the importEveShipFitHash() function instead.
 */
export const ImportEveShipFitHash = (props: ImportEveShipFitHashProps) => {
  const importEveShipFitHash = useImportEveShipFitHash();
  const [fit, setFit] = React.useState<EsfFit | null | undefined>(undefined);

  const importEveShipFitHashRef = React.useRef(importEveShipFitHash);
  importEveShipFitHashRef.current = importEveShipFitHash;

  React.useEffect(() => {
    async function getFit(fitHash: string) {
      setFit(await importEveShipFitHashRef.current(fitHash));
    }

    getFit(props.fitHash);
  }, [props.fitHash]);

  if (props.fitHash === undefined) {
    return <div>Select a fit hash.</div>;
  }

  return (
    <div>
      Hash: <pre>{props.fitHash}</pre>
      Fit: <pre>{JSON.stringify(fit, null, 2)}</pre>
    </div>
  );
};
