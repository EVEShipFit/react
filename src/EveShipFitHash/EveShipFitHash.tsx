import React from "react";

import { EsiFit } from "../ShipSnapshotProvider";

async function decompress(base64compressedBytes: string): Promise<string> {
  const stream = new Blob([Uint8Array.from(atob(base64compressedBytes), c => c.charCodeAt(0))]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));
  const reader = decompressedStream.getReader();

  let result = "";
  while (true) {
      const {done, value} = await reader.read();
      if (done) break;

      result += String.fromCharCode.apply(null, value);
  }

  return result;
}

async function decodeEsiFit(fitVersion: string, fitCompressed: string): Promise<EsiFit | undefined> {
  if (fitVersion != "v1") return undefined;

  const fitEncoded = await decompress(fitCompressed);

  const fitLines = fitEncoded.trim().split("\n");
  const fitHeader = fitLines[0].split(",");

  const fitItems = fitLines.slice(1).map((line) => {
    const item = line.split(",");
    return {
      flag: parseInt(item[0]),
      type_id: parseInt(item[1]),
      quantity: parseInt(item[2]),
    };
  });

  return {
    ship_type_id: parseInt(fitHeader[0]),
    name: fitHeader[1],
    description: fitHeader[2],
    items: fitItems,
  };
}

/**
 * Convert a hash from window.location.hash to an ESI fit.
 */
export async function eveShipFitHash(fitHash: string): Promise<EsiFit | undefined> {
  if (!fitHash) return undefined;

  const fitPrefix = fitHash.split(":")[0];
  const fitVersion = fitHash.split(":")[1];
  const fitEncoded = fitHash.split(":")[2];

  if (fitPrefix !== "fit") return undefined;

  const esiFit = await decodeEsiFit(fitVersion, fitEncoded);
  return esiFit;
}

export interface EveShipFitHashProps {
  /** The hash of the fit string. */
  fitHash: string;
}

/**
 * eveShipFitHash(fitHash) converts a hash from window.location.hash to an ESI fit.
 *
 * Note: do not use this React component itself, but the eveShipFitHash() function instead.
 */
export const EveShipFitHash = (props: EveShipFitHashProps) => {
  const [esiFit, setEsiFit] = React.useState<EsiFit | undefined>(undefined);

  React.useEffect(() => {
    async function getFit(fitHash: string) {
      setEsiFit(await eveShipFitHash(fitHash));
    }

    getFit(props.fitHash);
  }, [props.fitHash]);

  return <pre>{JSON.stringify(esiFit, null, 2)}</pre>
};
