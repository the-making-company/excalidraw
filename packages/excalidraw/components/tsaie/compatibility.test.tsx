import React from "react";

import { Excalidraw, restoreElements, serializeAsJSON } from "../../index";
import { render, waitFor } from "../../tests/test-utils";

it("keeps the legacy API callback used by TSAIE and preserves custom data", async () => {
  const receive = vi.fn();
  const elements = restoreElements(
    [
      {
        id: "synthetic-card",
        type: "rectangle",
        x: 10,
        y: 10,
        width: 100,
        height: 60,
        customData: { kind: "tsaie.synthetic", title: "Synthetic card" },
      },
    ],
    null,
  );
  await render(
    <Excalidraw excalidrawAPI={receive} initialData={{ elements }} />,
  );
  await waitFor(() => expect(receive).toHaveBeenCalled());
  const api = receive.mock.calls[0][0];
  expect(typeof api.getSceneElementsIncludingDeleted).toBe("function");
  expect(typeof api.addFiles).toBe("function");
  expect(typeof api.updateScene).toBe("function");
  await waitFor(() => expect(api.getSceneElements()).toHaveLength(1));
  const saved = JSON.parse(
    serializeAsJSON(
      api.getSceneElements(),
      api.getAppState(),
      api.getFiles(),
      "database",
    ),
  );
  expect(saved.elements[0].customData).toEqual({
    kind: "tsaie.synthetic",
    title: "Synthetic card",
  });
  expect(restoreElements(saved.elements, null)[0].customData).toEqual(
    saved.elements[0].customData,
  );
});
