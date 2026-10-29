import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/http";
import { LoginScreen } from "./LoginScreen";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  showEnDialog: vi.fn(),
}));

vi.mock("./AppContext", () => ({
  useApp: () => ({ login: mocks.login }),
}));

vi.mock("../widgets/EnDialogService", () => ({
  showEnDialog: mocks.showEnDialog,
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    mocks.login.mockReset().mockResolvedValue(undefined);
    mocks.showEnDialog.mockReset().mockResolvedValue(undefined);
  });

  it("requires all three credentials before calling the login handler", async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.showEnDialog).toHaveBeenCalledWith(
      "error",
      "Company code, user code, and password are all required.",
    );
  });

  it("trims company and user codes and keeps the password unchanged", async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);

    await user.type(screen.getByLabelText(/Company code/), "  ACME  ");
    await user.type(screen.getByLabelText(/User code/), "  jsmith  ");
    await user.type(screen.getByLabelText(/Password/), " secret ");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith("ACME", "jsmith", " secret ");
    });
  });

  it("shows and hides the password", async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);
    const password = screen.getByLabelText(/Password/);

    expect(password.getAttribute("type")).toBe("password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password.getAttribute("type")).toBe("text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password.getAttribute("type")).toBe("password");
  });

  it("uses the shared error dialog for rejected credentials", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue(new ApiError("Unauthorized", 401));
    render(<LoginScreen />);

    await user.type(screen.getByLabelText(/Company code/), "ACME");
    await user.type(screen.getByLabelText(/User code/), "jsmith");
    await user.type(screen.getByLabelText(/Password/), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mocks.showEnDialog).toHaveBeenCalledWith(
        "error",
        "Invalid company code, user code, or password.",
      );
    });
  });
});
