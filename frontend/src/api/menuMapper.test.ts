import { describe, expect, it } from "vitest";
import { mapMenuDtoToNodes } from "./menuMapper";

describe("mapMenuDtoToNodes", () => {
  it("resolves the Supabase item registration menu to its feature screen", () => {
    const nodes = mapMenuDtoToNodes([
      {
        cdMenu: "MAS",
        nmMenu: "Master Menu",
        fgType: "F",
      },
      {
        cdMenu: "EN_MAS_BAS_REG_001",
        nmMenu: "Item registration",
        nmNetwindow: "EN_MAS_BAS_REG_001",
        cdModule: "BAS",
        cdMenuParent: "MAS",
      },
    ]);

    expect(nodes[0]?.children?.[0]).toMatchObject({
      id: "EN_MAS_BAS_REG_001",
      kind: "screen",
      screen: "EN_MAS_BAS_REG_001",
    });
  });
});
