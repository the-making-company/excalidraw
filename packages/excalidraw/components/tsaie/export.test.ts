import { restoreElements } from "../../data/restore";
import { exportToCanvas, exportToSvg, exportToBlob } from "../../tsaie-export";

const elements = restoreElements(
  [{ type: "rectangle", x: 0, y: 0, width: 100, height: 60 }],
  null,
);
it("preserves legacy sizing callbacks and padding for TSAIE PNG exports", async () => {
  const getDimensions = vi.fn((width: number, height: number) => ({
    width: width * 2,
    height: height * 2,
    scale: 2,
  }));
  const canvas = await exportToCanvas({
    elements,
    files: {},
    exportPadding: 10,
    getDimensions,
  });
  expect(getDimensions).toHaveBeenCalledWith(120, 80);
  expect([canvas.width, canvas.height]).toEqual([240, 160]);
});
it("keeps the legacy SVG and PNG helpers callable", async () => {
  const svg = await exportToSvg({
    elements,
    files: {},
    appState: { exportBackground: true, viewBackgroundColor: "#ffffff" },
  });
  expect(svg.tagName.toLowerCase()).toBe("svg");
  const blob = await exportToBlob({
    elements,
    files: {},
    mimeType: "image/png",
  });
  expect(blob.type).toBe("image/png");
});
