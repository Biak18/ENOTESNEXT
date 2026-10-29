import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { EnCommonDialog } from "./EnCommonDialog";
import type { EnDialogType } from "./EnCommonDialog";
import EnCommonModal from "./EnCommonModal";
import type { ReactNode } from "react";

export function showEnDialog(
  type: EnDialogType,
  message: string,
  title?: string,
): Promise<boolean | undefined> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  return new Promise((resolve) => {
    const finish = (result: boolean | undefined) => {
      root.unmount();
      container.remove();
      resolve(result);
    };
    root.render(
      <EnCommonDialog
        open
        type={type}
        message={message}
        title={title}
        onResolve={finish}
      />,
    );
  });
}

export interface EnPopupModalOptions {
  title: string;
  children: ReactNode;
  width?: number | string;
  height?: number | string;
  showConfirm?: boolean;
}

export function showEnPopupModal(
  options: EnPopupModalOptions,
): Promise<boolean | undefined> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  return new Promise((resolve) => {
    const finish = (result: boolean | undefined) => {
      root.unmount();
      container.remove();
      resolve(result);
    };
    root.render(
      <EnCommonModal
        open
        title={options.title}
        width={options.width}
        height={options.height}
        showConfirm={options.showConfirm}
        onConfirm={() => finish(true)}
        onClose={() => finish(undefined)}
      >
        {options.children}
      </EnCommonModal>,
    );
  });
}
