// Build first. Stage release manifests without renaming upstream source imports.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const version = "0.18.0-tsaie.1";
const names = [
  "common",
  "fractional-indexing",
  "laser-pointer",
  "math",
  "element",
  "excalidraw",
];
const packageName = (name) =>
  `@the-making-company/${name === "excalidraw" ? name : `excalidraw-${name}`}`;
const out = path.join(root, "dist/tsaie-packages");
fs.mkdirSync(out, { recursive: true });
for (const name of names) {
  const source = path.join(root, "packages", name);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(source, "package.json"), "utf8"),
  );
  const target = path.join(out, name);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(path.join(source, "dist"), path.join(target, "dist"), {
    recursive: true,
  });
  for (const section of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const dependency of names) {
      const key = `@excalidraw/${dependency}`;
      if (manifest[section]?.[key])
        manifest[section][key] = `npm:${packageName(dependency)}@${version}`;
    }
  }
  manifest.name = packageName(name);
  manifest.version = version;
  manifest.repository = {
    type: "git",
    url: "https://github.com/the-making-company/excalidraw.git",
    directory: `packages/${name}`,
  };
  manifest.publishConfig = { registry: "https://npm.pkg.github.com" };
  delete manifest.scripts;
  delete manifest.devDependencies;
  fs.writeFileSync(
    path.join(target, "package.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  fs.copyFileSync(path.join(root, "LICENSE"), path.join(target, "LICENSE"));
}
console.log(`Staged ${names.length} packages at ${version}`);
