import type { ForwardRefExoticComponent, RefAttributes, RefObject } from "react";
import type { Action, ScreenKey } from "../types";

export type ScreenHandle = Partial<Record<Action, () => void>> & {
  /** May present the asynchronous En confirm dialog — return false to keep the tab. */
  canClose?: () => boolean | Promise<boolean>;
};

export type ScreenProps = {
  screen: ScreenKey;
  tabTitle: string;
  notify: (message: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
};

export type ScreenComponent = ForwardRefExoticComponent<
  ScreenProps & RefAttributes<ScreenHandle>
>;
