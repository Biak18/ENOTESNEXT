import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EnFileUpload from "./EnFileUpload";
import EnTextBox from "./EnTextBox";

describe("EN shared controls", () => {
  it("formats text input and follows a changed default value", () => {
    const onValueChanged = vi.fn();
    const { rerender } = render(
      <EnTextBox defaultValue="12345" format="###-##" onValueChanged={onValueChanged} />,
    );
    const input = screen.getByRole("textbox");

    expect((input as HTMLInputElement).value).toBe("123-45");
    fireEvent.change(input, { target: { value: "45678" } });
    expect((input as HTMLInputElement).value).toBe("456-78");
    expect(onValueChanged).toHaveBeenLastCalledWith("456-78");

    rerender(
      <EnTextBox defaultValue="98765" format="###-##" onValueChanged={onValueChanged} />,
    );
    expect((input as HTMLInputElement).value).toBe("987-65");
  });

  it("keeps file actions local and reports selected or removed files by callback", async () => {
    const user = userEvent.setup();
    const onFilesChanged = vi.fn();
    const file = new File(["contents"], "invoice.pdf", { type: "application/pdf" });

    const { rerender } = render(
      <EnFileUpload files={[]} onFilesChanged={onFilesChanged} />,
    );
    await user.upload(screen.getByLabelText("Attach"), file);
    expect(onFilesChanged).toHaveBeenLastCalledWith([file]);

    rerender(
      <EnFileUpload files={[file]} onFilesChanged={onFilesChanged} />,
    );
    await user.click(screen.getByRole("button", { name: "Remove invoice.pdf" }));
    expect(onFilesChanged).toHaveBeenLastCalledWith([]);
  });
});
