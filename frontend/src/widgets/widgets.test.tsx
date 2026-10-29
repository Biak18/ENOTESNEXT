import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EnSharedForm from "./EnSharedForm";
import EnSearchPanel from "./EnSearchPanel";
import EnSinglePopup from "./commonpopup/EnSinglePopup";
import EnResetPwdPopup from "./commonpopup/EnResetPwdPopup";

describe("ENOTES widgets", () => {
  it("renders a schema-driven form and reports local edits", async () => {
    const user = userEvent.setup();
    const onValueChanged = vi.fn();

    render(
      <EnSharedForm
        fields={[{ id: "customer", label: "Customer", required: true }]}
        defaultValues={{ customer: "Northwind" }}
        onValueChanged={onValueChanged}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Customer" });
    expect((input as HTMLInputElement).value).toBe("Northwind");
    await user.clear(input);
    await user.type(input, "Contoso");
    expect(onValueChanged).toHaveBeenLastCalledWith(
      "customer",
      "Contoso",
      { customer: "Contoso" },
    );
  });

  it("selects a caller-provided row without a grid dependency", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <EnSinglePopup
        open
        title="Customers"
        rows={[{ code: "C1", name: "Northwind" }]}
        columns={[
          { field: "code", label: "Code" },
          { field: "name", label: "Name" },
        ]}
        keyField="code"
        onClose={vi.fn()}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("row", { name: /C1 Northwind/ }));
    await user.click(screen.getByRole("button", { name: "Select" }));
    expect(onSelect).toHaveBeenCalledWith({ code: "C1", name: "Northwind" });
  });

  it("shows rejected mock search errors in the search panel", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn().mockRejectedValue(new Error("Demo search failed"));

    render(
      <EnSearchPanel
        fields={[]}
        onSearch={onSearch}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Search" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Demo search failed");
  });

  it("allows a password reset callback only when both local fields match", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<EnResetPwdPopup open onClose={vi.fn()} onReset={onReset} />);
    const reset = screen.getByRole("button", { name: "Reset" });
    expect((reset as HTMLButtonElement).disabled).toBe(true);

    await user.type(screen.getByLabelText("New password"), "local-password");
    await user.type(screen.getByLabelText("Confirm password"), "local-password");
    expect((reset as HTMLButtonElement).disabled).toBe(false);
    await user.click(reset);
    expect(onReset).toHaveBeenCalledWith("local-password");
  });
});
