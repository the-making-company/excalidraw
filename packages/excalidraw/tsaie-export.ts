/** Compatibility with the 0.18 editor export API used by existing hosts. */
import type {
  NonDeletedExcalidrawElement,
  ExcalidrawFrameLikeElement,
} from "@excalidraw/element/types";

import {
  exportScene,
  exportToClipboard as exportSceneToClipboard,
} from "./scene/export";
import { serializeAsJSON } from "./data/json";
import { encodePngMetadata } from "./data/image";
import {
  copyBlobToClipboardAsPng,
  copyTextToSystemClipboard,
  copyToClipboard,
} from "./clipboard";

import type { AppState, BinaryFiles } from "./types";

export type LegacyExportOptions = {
  elements: readonly NonDeletedExcalidrawElement[];
  appState?: Partial<AppState>;
  files: BinaryFiles | null;
  maxWidthOrHeight?: number;
  exportingFrame?: ExcalidrawFrameLikeElement | null;
  exportPadding?: number;
  getDimensions?: (
    width: number,
    height: number,
  ) => { width: number; height: number; scale?: number };
};

const config = (opts: LegacyExportOptions) => ({
  padding: opts.exportPadding,
  theme: opts.appState?.exportWithDarkMode
    ? ("dark" as const)
    : ("light" as const),
  canvasBackgroundColor:
    opts.appState?.exportBackground === false
      ? (false as const)
      : opts.appState?.viewBackgroundColor,
  exportingFrame: opts.exportingFrame?.isDeleted
    ? null
    : (opts.exportingFrame as NonNullable<
        Parameters<typeof exportScene>[0]["config"]
      >["exportingFrame"]),
  frames:
    opts.appState?.frameRendering?.enabled === false
      ? { name: false, outline: false, clip: false }
      : opts.appState?.frameRendering,
});

export const exportToCanvas = async (
  opts: LegacyExportOptions,
): Promise<HTMLCanvasElement> => {
  let dimensions: { width: number; height: number; scale?: number } | undefined;
  const canvas = await exportScene({
    type: "canvas",
    data: opts,
    config: {
      ...config(opts),
      scale: (width, height) => {
        if (opts.maxWidthOrHeight) {
          const max = Math.max(width, height);
          return opts.maxWidthOrHeight < max
            ? opts.maxWidthOrHeight / max
            : opts.appState?.exportScale ?? 1;
        }
        dimensions = opts.getDimensions?.(width, height);
        return dimensions?.scale ?? 1;
      },
    },
  });
  if (
    !dimensions ||
    (canvas.width === dimensions.width && canvas.height === dimensions.height)
  ) {
    return canvas;
  }
  const sized = canvas.ownerDocument.createElement("canvas");
  sized.width = dimensions.width;
  sized.height = dimensions.height;
  sized.getContext("2d")?.drawImage(canvas, 0, 0);
  return sized;
};

export const exportToBlob = async (
  opts: LegacyExportOptions & { mimeType?: string; quality?: number },
): Promise<Blob> => {
  const mimeType =
    opts.mimeType === "image/jpg" ? "image/jpeg" : opts.mimeType ?? "image/png";
  const canvas = await exportToCanvas(
    mimeType === "image/jpeg"
      ? { ...opts, appState: { ...opts.appState, exportBackground: true } }
      : opts,
  );
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value ? resolve(value) : reject(new Error("couldn't export to blob")),
      mimeType,
      opts.quality ?? 0.92,
    ),
  );
  return mimeType === "image/png" && opts.appState?.exportEmbedScene
    ? encodePngMetadata({
        blob,
        metadata: serializeAsJSON(
          opts.elements,
          opts.appState,
          opts.files ?? {},
          "local",
        ),
      })
    : blob;
};

export const exportToSvg = (
  opts: LegacyExportOptions & {
    renderEmbeddables?: boolean;
    skipInliningFonts?: true;
    reuseImages?: boolean;
  },
) =>
  exportScene({
    type: "svg",
    data: opts,
    config: {
      ...config(opts),
      embedScene: opts.appState?.exportEmbedScene,
      renderEmbeddables: opts.renderEmbeddables,
      skipInliningFonts: opts.skipInliningFonts,
      reuseImages: opts.reuseImages,
    },
  });

export const exportToClipboard = async (
  opts:
    | Parameters<typeof exportSceneToClipboard>[0]
    | (LegacyExportOptions & {
        type: "png" | "svg" | "json";
        mimeType?: string;
        quality?: number;
      }),
) => {
  if ("data" in opts) {
    return exportSceneToClipboard(opts);
  }
  if (opts.type === "svg") {
    return copyTextToSystemClipboard((await exportToSvg(opts)).outerHTML);
  }
  if (opts.type === "png") {
    return copyBlobToClipboardAsPng(exportToBlob(opts));
  }
  return copyToClipboard(opts.elements, opts.files);
};
