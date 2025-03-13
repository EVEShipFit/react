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

    result += String.fromCharCode.apply(null, [...value]);
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
 * `fullLink` controls whether to only show the esfEncoded part, or the full link.
 */
export function useExportEveShipFit(fullLink?: boolean) {
  const currentFit = useCurrentFit();

  const [esfEncoded, setEsfEncoded] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function createEsfEncoded(fit: EsfFit | null) {
      if (fit === null) {
        setEsfEncoded(null);
        return;
      }

      const newEsfEncoded = await encodeFit(fit);
      setEsfEncoded((fullLink || fullLink === undefined ? "https://eveship.fit/?fit=" : "") + newEsfEncoded);
    }

    createEsfEncoded(currentFit.currentFit);
  }, [currentFit.currentFit, fullLink]);

  return esfEncoded;
}

export interface ExportEveShipFitProps {
  /** Whether to only show the esfEncoded part, or the full link. */
  fullLink?: boolean;
}

/**
 * `useExportEveShipFit` converts the current fit into a link to https://eveship.fit.
 *
 * Note: do not use this React component itself, but the `useExportEveShipFit` React hook instead.
 */
export const ExportEveShipFit = (props: ExportEveShipFitProps) => {
  const exportEveShipFit = useExportEveShipFit(props.fullLink);

  if (exportEveShipFit === null) return <></>;

  return <pre>{exportEveShipFit}</pre>;
};
