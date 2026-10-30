# TSAIE editor fork

This fork keeps Excalidraw's drawing engine and scene format. Its shared button, icon/toggle, text/number input and checkbox controls use Base UI adapters. Tailwind compiles the scoped control, menu, tooltip, dialog and panel styles into index.css. Existing Radix menu interactions and dialog focus handling remain in place; the specialized pickers and drawing tools retain their behavior and layout styles.

## Compatibility

The old `excalidrawAPI` callback remains supported alongside `onExcalidrawAPI`. If both use the same callback it is invoked once. Only the new callback receives null on teardown. The legacy exportToCanvas, exportToBlob, exportToSvg and exportToClipboard helpers adapt to the new renderer, including TSAIE’s getDimensions callback. Consumers should retain client-only loading and use the shipped CSS. The fork reads `--color-fd-*` tokens and falls back to standalone light/dark colors. Tailwind uses the `exc` prefix without preflight. Portals retain the `.excalidraw` and `.theme--dark` classes expected by embedding applications.

## Build and release

Use Yarn 1.22.22 and Node 22 or newer:

```
yarn install --frozen-lockfile
yarn build:packages
node scripts/stage-tsaie-packages.cjs
node scripts/verify-tsaie-packages.cjs
```

The staging script creates six manifests under ignored `dist/tsaie-packages`. Source workspace names remain upstream-compatible. Published packages use the `@the-making-company` scope; internal dependencies are exact aliases to companion packages at the same release version. Bump the version in staging and verification scripts together for each release. Never republish a version with changed bytes.

After review, run the **TSAIE packages** workflow from the reviewed branch. It validates, builds and publishes with the repository's GITHUB_TOKEN. GitHub requires this workflow to be available on the default branch before manual dispatch. Grant the TSAIE repository Actions read access to all six packages in GitHub's package settings before switching its dependency. No personal token is stored here. A partially published release must be inspected before rerunning; do not overwrite already published versions.

## Consumer setup

Install the editor under the existing import name:

```
@excalidraw/excalidraw: npm:@the-making-company/excalidraw@0.18.0-tsaie.1
```

Configure `@the-making-company:registry=https://npm.pkg.github.com` and provide NODE_AUTH_TOKEN with read:packages through the environment. GitHub Packages may require authentication even for public packages. Copy the installed production `fonts` directory to the app's public `excalidraw-assets/fonts` directory and set `window.EXCALIDRAW_ASSET_PATH='/excalidraw-assets/'` before loading the editor. Do not rely on a public CDN to serve private fork assets.

Rollback is the previous exact editor dependency and lockfiles. No scene migration is needed. UI styling does not change persisted documents or image-card customData.
