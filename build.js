// Minimal build: minify src/ into dist/. No config files, no bundler setup beyond esbuild itself.
const esbuild = require("esbuild");
const fs = require("fs");

fs.mkdirSync("dist", { recursive: true });

esbuild.buildSync({
  entryPoints: ["src/widget.js"],
  outfile: "dist/widget.js",
  minify: true,
  target: "es2017"
});

esbuild.buildSync({
  entryPoints: ["src/widget.css"],
  outfile: "dist/widget.css",
  minify: true
});

console.log("Built dist/widget.js and dist/widget.css");
