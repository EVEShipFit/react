import clsx from "clsx";
import React from "react";

import { Icon, IconName } from "../Icon";

import styles from "./TreeListing.module.css";

interface Tree {
  size: number;
}

export const TreeContext = React.createContext<Tree>({size: 24});

/**
 * Action (the icon on the right side of the header) for a header.
 */
export const TreeHeaderAction = (props: { icon: IconName, onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void }) => {
  const tree = React.useContext(TreeContext);

  return <div className={styles.headerAction} onClick={props.onClick}>
    <Icon name={props.icon} size={tree.size} />
  </div>
}

/**
 * Header for a listing.
 */
export const TreeHeader = (props: { icon?: string, text: string, action?: React.ReactNode }) => {
  const tree = React.useContext(TreeContext);

  return <>
    {props.icon !== undefined && <span>
      <img src={props.icon} height={tree.size} width={tree.size} alt="" />
    </span>}
    <span className={styles.headerText}>
      {props.text}
    </span>
    {props.action && <span>
      {props.action}
    </span>}
  </>
}

export const TreeLeaf = (props: { level: number, height?: number, content: string, onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void }) => {
  const stylesHeader = styles[`header${props.level}`];

  const height = props.height ?? 20;
  const style = { "--height": `${height}px` } as React.CSSProperties;

  return <div>
      <TreeContext.Provider value={{size: height}}>
        <div style={style} className={clsx(styles.header, stylesHeader, {[styles.headerHover]: props.onClick !== undefined, [styles.leaf]: props.onClick !== undefined})} onClick={props.onClick}>
          <span className={styles.headerText}>
            {props.content}
          </span>
        </div>
      </TreeContext.Provider>
    </div>;
}

/**
 * Tree listing for hulls, modules, and charges.
 */
export const TreeListing = (props: { level: number, header: React.ReactNode, height?: number, getChildren: () => React.ReactNode }) => {
  const [expanded, setExpanded] = React.useState(false);

  const stylesHeader = styles[`header${props.level}`];
  const stylesContent = styles[`content${props.level}`];

  const height = props.height ?? 20;
  const style = { "--height": `${height}px` } as React.CSSProperties;

  let children: React.ReactNode = <></>;
  /* Speed up rendering by not rendering children if we are collapsed. */
  if (expanded) {
    children = props.getChildren();
  }

  return <div>
    <TreeContext.Provider value={{size: height}}>
      <div style={style} className={clsx(styles.header, styles.headerHover, stylesHeader)} onClick={() => setExpanded((current) => !current)}>
        <span>
          <Icon name={expanded ? "menu-expand" : "menu-collapse"} size={12} />
        </span>
        {props.header}
      </div>
      <div className={clsx(styles.content, stylesContent)}>
        {children}
      </div>
    </TreeContext.Provider>
  </div>
};
