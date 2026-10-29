import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EnCommonDialog } from "./EnCommonDialog";
import { EnCommonDialogPreview } from "./EnCommonDialog.preview";

describe("EnCommonDialog", () => {
  it("shows the information title and resolves a notice with undefined", async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn();

    render(
      <EnCommonDialog
        open
        type="info"
        message="Example information."
        onResolve={onResolve}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Information" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Example information.");
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(onResolve).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it("exposes error messages to assistive technology", () => {
    const onResolve = vi.fn();

    render(
      <EnCommonDialog
        open
        type="error"
        message="Example error."
        title="Custom title"
        onResolve={onResolve}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Custom title" })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Example error.");
  });

  it("keeps warning messages in the alert announcement role", () => {
    const onResolve = vi.fn();

    render(
      <EnCommonDialog
        open
        type="warning"
        message="Example warning."
        onResolve={onResolve}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Warning" })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Example warning.");
  });

  it("resolves a Yes confirmation once and prevents repeated resolution", async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn();

    render(
      <EnCommonDialog
        open
        type="confirm"
        message="Continue?"
        onResolve={onResolve}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(onResolve).toHaveBeenCalledExactlyOnceWith(true);
    expect((screen.getByRole("button", { name: "No" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("resolves a No confirmation with false", async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn();

    render(
      <EnCommonDialog
        open
        type="confirm"
        message="Continue?"
        onResolve={onResolve}
      />,
    );

    await user.click(screen.getByRole("button", { name: "No" }));
    expect(onResolve).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("resolves confirm-cancel actions with their distinct values", async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn();

    render(
      <EnCommonDialog
        open
        type="confirmCancel"
        message="Save changes?"
        onResolve={onResolve}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onResolve).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it("resolves an Escape dismissal as false", async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn();

    render(
      <EnCommonDialog
        open
        type="confirm"
        message="Continue?"
        onResolve={onResolve}
      />,
    );

    await user.keyboard("{Escape}");
    expect(onResolve).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("renders a success status using the default title", () => {
    const onResolve = vi.fn();

    render(
      <EnCommonDialog
        open
        type="success"
        message="Example success."
        onResolve={onResolve}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Success" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Example success.");
  });

  it("shows all eight interactive and message states in the preview", () => {
    render(<EnCommonDialogPreview />);

    for (const state of [
      "Default",
      "Hover",
      "Focus",
      "Active",
      "Disabled",
      "Loading",
      "Error",
      "Success",
    ]) {
      expect(screen.getByText(state)).toBeTruthy();
    }
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });
});
