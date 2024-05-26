import React from "react";

import { useEveData } from "@/providers/EveDataProvider";
import { useStatistics } from "@/providers/StatisticsProvider";

import styles from "./ShipFit.module.css";

const getPositionOnCircle = (angle: number, radius: number, center: number) => {
  const x = radius * Math.cos((angle * Math.PI) / 180) + center;
  const y = radius * Math.sin((angle * Math.PI) / 180) + center;
  return { x, y };
};

export const Usage = (props: {
  type: "rig" | "cpu" | "pg";
  angle: number;
  intervals: number;
  markers: number;
  color: string;
}) => {
  const eveData = useEveData();
  const statistics = useStatistics();

  if (eveData === null) return <></>;

  let usageTotal;
  let usageUsed;

  switch (props.type) {
    case "rig":
      usageTotal = statistics?.hull.attributes?.get(eveData.attributeMapping.upgradeCapacity ?? 0)?.value ?? 0;
      usageUsed =
        statistics?.items.reduce(
          (acc, item) => acc + (item.attributes?.get(eveData.attributeMapping.upgradeCost ?? 0)?.value ?? 0),
          0,
        ) ?? 0;
      break;

    case "cpu":
      usageTotal = statistics?.hull.attributes?.get(eveData.attributeMapping.cpuOutput ?? 0)?.value ?? 0;
      usageUsed = usageTotal - (statistics?.hull.attributes?.get(eveData.attributeMapping.cpuUnused ?? 0)?.value ?? 0);
      break;

    case "pg":
      usageTotal = statistics?.hull.attributes?.get(eveData.attributeMapping.powerOutput ?? 0)?.value ?? 0;
      usageUsed =
        usageTotal - (statistics?.hull.attributes?.get(eveData.attributeMapping.powerUnused ?? 0)?.value ?? 0);
      break;
  }

  /* Don't try to draw more than 100%. */
  if (usageUsed > usageTotal) usageUsed = usageTotal;

  const radius = 232;
  const degrees = props.angle;
  const usageDegrees = (degrees * usageUsed) / usageTotal;

  const pointsInterval = degrees / props.intervals;
  const points = Array.from({ length: props.intervals }, (_, i) => {
    const angle = i * pointsInterval - 90;

    const inner = getPositionOnCircle(angle, radius - 15, 232 + 24);
    const outer = getPositionOnCircle(angle, radius - 9, 232 + 24);

    return { inner, outer };
  });
  const markersInterval = degrees / (props.markers - 1);
  const markers = Array.from({ length: props.markers }, (_, i) => {
    const angle = i * markersInterval - 90;

    const inner = getPositionOnCircle(angle, radius - 15, 232 + 24);
    const outer = getPositionOnCircle(angle, radius - 2, 232 + 24);

    return { inner, outer };
  });
  const usage = {
    start: getPositionOnCircle(-90, radius - 10, 232 + 24),
    end: getPositionOnCircle(-90 + usageDegrees, radius - 10, 232 + 24),
    radius: radius - 10,
  };

  return (
    <svg viewBox="24 24 464 464" xmlns="http://www.w3.org/2000/svg" className={styles.ringOuter}>
      <g>
        <path
          style={{ fill: "none", stroke: props.color, strokeWidth: 10 }}
          d={`M ${usage.start.x} ${usage.start.y} A ${usage.radius} ${usage.radius} 0 0 ${props.angle >= 0 ? "1" : "0"} ${usage.end.x} ${usage.end.y}`}
        />

        {markers.map((marker, i) => (
          <path
            key={i}
            style={{ fill: "none", stroke: "#7a7a7a", strokeWidth: 1 }}
            d={`M ${marker.inner.x} ${marker.inner.y} L ${marker.outer.x} ${marker.outer.y}`}
          />
        ))}

        {points.map((point, i) => (
          <path
            key={i}
            style={{ fill: "none", stroke: "#7a7a7a", strokeWidth: 1 }}
            d={`M ${point.inner.x} ${point.inner.y} L ${point.outer.x} ${point.outer.y}`}
          />
        ))}
      </g>
    </svg>
  );
};
