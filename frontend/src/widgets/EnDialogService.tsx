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


/** Buttons layout for a question/confirmation dialog. */
export type EnConfirmButtons = "yesNo" | "yesNoCancel";
export type EnConfirmResult = true | false | undefined; // Yes | No | Cancel/closed

/**
 * Question dialog (SNOTES SnQuestionBox): Yes/No — optionally with Cancel.
 * Resolves true for Yes, false for No, undefined for Cancel/backdrop-close,
 * so callers that only care about Yes/No can just check truthiness while
 * Cancel stays distinguishable when needed.
 */
export function showEnConfirm(
  message: string,
  options?: {
    title?: string;
    buttons?: EnConfirmButtons; // default "yesNo"
  },
): Promise<EnConfirmResult> {
  return showEnDialog(
    (options?.buttons ?? "yesNo") === "yesNoCancel" ? "confirmCancel" : "confirm",
    message,
    options?.title,
  );
}