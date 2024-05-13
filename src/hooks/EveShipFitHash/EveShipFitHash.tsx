import React from "react";

import { EsiFit } from "../../providers/ShipSnapshotProvider";
import { EveDataContext } from "../../providers/EveDataProvider";
import { useFormatEftToEsi } from "../FormatEftToEsi";

async function decompress(base64compressedBytes: string): Promise<string> {
  const stream = new Blob([Uint8Array.from(atob(base64compressedBytes), (c) => c.charCodeAt(0))]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));
  const reader = decompressedStream.getReader();

  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    result += String.fromCharCode.apply(null, value);
  }

  return result;
}

async function decodeEsiFitV1(fitCompressed: string): Promise<EsiFit | undefined> {
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

async function decodeEsiFitV2(fitCompressed: string): Promise<EsiFit | undefined> {
  const fitEncoded = await decompress(fitCompressed);

  const fitLines = fitEncoded.trim().split("\n");
  const fitHeader = fitLines[0].split(",");

  const fitItems = fitLines.slice(1).map((line) => {
    const item = line.split(",");

    let charge = undefined;
    if (item[3]) {
      charge = {
        type_id: parseInt(item[3]),
      };
    }

    return {
      flag: parseInt(item[0]),
      type_id: parseInt(item[1]),
      quantity: parseInt(item[2]),
      charge,
      state: item[4] || undefined,
    };
  });

  return {
    ship_type_id: parseInt(fitHeader[0]),
    name: fitHeader[1],
    description: fitHeader[2],
    items: fitItems,
  };
}

function useFetchKillMail() {
  const eveData = React.useContext(EveDataContext);

  return async (killMailHash: string): Promise<EsiFit | undefined> => {
    /* The hash is in the format "id/hash". */
    const [killmailId, killmailHash] = killMailHash.split("/", 2);

    /* Fetch the killmail from ESI. */
    const response = await fetch(`https://esi.evetech.net/v1/killmails/${killmailId}/${killmailHash}/`);
    if (response.status !== 200) return undefined;

    const killMail = await response.json();

    /* Convert the killmail to a fit; be mindful that ammo and a module can be on the same slot. */
    let fitItems: EsiFit["items"] = killMail.victim.items.map(
      (item: { flag: number; item_type_id: number; quantity_destroyed?: number; quantity_dropped?: number }) => {
        return {
          flag: item.flag,
          type_id: item.item_type_id,
          quantity: (item.quantity_dropped ?? 0) + (item.quantity_destroyed ?? 0),
        };
      },
    );

    fitItems = fitItems
      .map((item) => {
        /* When importing fits, it can be that the ammo is on the same slot as the module, instead as charge. Fix that. */

        /* Ignore cargobay. */
        if (item.flag === 5) return item;
        /* Looks for items that are charges. */
        if (eveData.typeIDs?.[item.type_id]?.categoryID !== 8) return item;

        /* Find the module on the same slot. */
        const module = fitItems.find(
          (itemModule) => itemModule.flag === item.flag && itemModule.type_id !== item.type_id,
        );

        if (module !== undefined) {
          /* Assign the charge to the module. */
          module.charge = {
            type_id: item.type_id,
          };
        }

        /* Remove the charge from the slot. */
        return undefined;
      })
      .filter((item): item is EsiFit["items"][number] => item !== undefined);

    return {
      ship_type_id: killMail.victim.ship_type_id,
      name: `Killmail ${killmailId}`,
      description: "",
      items: fitItems,
    };
  };
}

function useDecodeEft() {
  const formatEftToEsi = useFormatEftToEsi();

  return async (eftCompressed: string): Promise<EsiFit | undefined> => {
    const eft = await decompress(eftCompressed);
    return formatEftToEsi(eft);
  };
}

/**
 * Convert a hash from window.location.hash to an ESI fit.
 */
export function useEveShipFitHash() {
  const fetchKillMail = useFetchKillMail();
  const decodeEft = useDecodeEft();

  return async (fitHash: string): Promise<EsiFit | undefined> => {
    if (!fitHash) return undefined;

    const fitPrefix = fitHash.split(":")[0];
    const fitVersion = fitHash.split(":")[1];
    const fitEncoded = fitHash.split(":")[2];

    if (fitPrefix !== "fit") return undefined;

    let esiFit = undefined;
    switch (fitVersion) {
      case "v1":
        esiFit = await decodeEsiFitV1(fitEncoded);
        break;
      case "v2":
        esiFit = await decodeEsiFitV2(fitEncoded);
        break;
      case "killmail":
        esiFit = await fetchKillMail(fitEncoded);
        break;
      case "eft":
        esiFit = await decodeEft(fitEncoded);
        break;
    }
    return esiFit;
  };
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
  const eveShipFitHash = useEveShipFitHash();
  const [esiFit, setEsiFit] = React.useState<EsiFit | undefined>(undefined);

  React.useEffect(() => {
    async function getFit(fitHash: string) {
      setEsiFit(await eveShipFitHash(fitHash));
    }

    getFit(props.fitHash);
  }, [props.fitHash, eveShipFitHash]);

  return <pre>{JSON.stringify(esiFit, null, 2)}</pre>;
};
