import React from "react";

import { EsfFit, useCurrentFit } from "@/providers/CurrentFitProvider";

async function compress(str: string): Promise<string> {
  const stream = new Blob([str]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
  const reader = compressedStream.getReader();

  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    result += String.fromCharCode.apply(null, value);
  }

  return btoa(result);
}

async function encodeFit(fit: EsfFit): Promise<string> {
  let result = `ship,${fit.shipTypeId},${fit.name},${fit.description}\n`;

  for (const module of fit.modules) {
    result += `module,${module.slot.type},${module.slot.index},${module.typeId},${module.state},${module.charge?.typeId ?? ""}\n`;
  }
  for (const drone of fit.drones) {
    result += `drone,${drone.typeId},${drone.states.Active},${drone.states.Passive}\n`;
  }
  for (const cargo of fit.cargo) {
    result += `cargo,${cargo.typeId},${cargo.quantity}\n`;
  }

  return "v3:" + (await compress(result));
}

/**
 * Returns a link to https://eveship.fit that contains the current fit.
 *
 * `hashOnly` controls whether to only show the hash, or the full link.
 */
export function useExportEveShipFitHash(hashOnly?: boolean) {
  const currentFit = useCurrentFit();

  const [fitHash, setFitHash] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function createHash(fit: EsfFit | null) {
      if (fit === null) {
        setFitHash(null);
        return;
      }

      const newFitHash = await encodeFit(fit);
      setFitHash((hashOnly ? "" : "https://eveship.fit/") + `#fit:${newFitHash}`);
    }

    createHash(currentFit.fit);
  }, [currentFit.fit, hashOnly]);

  return fitHash;
}

export interface ExportEveShipFitHashProps {
  /** Whether to only show the hash, not the full link. */
  hashOnly?: boolean;
}

/**
 * `useExportEveShipFitHash` converts the current fit into a link to https://eveship.fit.
 *
 * Note: do not use this React component itself, but the `useExportEveShipFitHash` React hook instead.
 */
export const ExportEveShipFitHash = (props: ExportEveShipFitHashProps) => {
  const exportEveShipFitHash = useExportEveShipFitHash(props.hashOnly);

  if (exportEveShipFitHash === null) return <></>;

  return <pre>{exportEveShipFitHash}</pre>;
};
