const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist/tsaie-packages");
const names = [
  "common",
  "fractional-indexing",
  "laser-pointer",
  "math",
  "element",
  "excalidraw",
];
for (const name of names) {
  const directory = path.join(root, name);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(directory, "package.json")),
  );
  assert.equal(
    manifest.name,
    `@the-making-company/${
      name === "excalidraw" ? name : `excalidraw-${name}`
    }`,
  );
  assert.equal(manifest.version, "0.18.0-tsaie.1");
  assert.equal(manifest.publishConfig.registry, "https://npm.pkg.github.com");
  for (const dependency of names) {
    const value = manifest.dependencies?.[`@excalidraw/${dependency}`];
    if (value)
      assert.equal(
        value,
        `npm:@the-making-company/${
          dependency === "excalidraw" ? dependency : `excalidraw-${dependency}`
        }@${manifest.version}`,
      );
  }
  for (const file of [
    manifest.types,
    manifest.main,
    "dist/dev/index.js",
    "LICENSE",
  ]) {
    assert.ok(fs.statSync(path.join(directory, file)).size, `${name}: ${file}`);
  }
}
const css = fs.readFileSync(
  path.join(root, "excalidraw/dist/prod/index.css"),
  "utf8",
);
assert.match(css, /tsaie-control/);
assert.doesNotMatch(css, /@apply|@import\s+["']tailwindcss/);
assert.ok(fs.readdirSync(path.join(root, "excalidraw/dist/prod/fonts")).length);
console.log(
  "Six isolated release manifests, compiled styles, types and font assets verified.",
);
