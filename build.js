// Build: inline widget.css into widget.js so the whole widget installs from one <script> tag,
// then minify both. No bundler config files beyond esbuild itself.
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

fs.mkdirSync("dist", { recursive: true });

const rawCss = fs.readFileSync("src/widget.css", "utf8");
const minifiedCss = esbuild.transformSync(rawCss, { loader: "css", minify: true }).code.trim();

const rawJs = fs.readFileSync("src/widget.js", "utf8");
const placeholder = '"__GHT_A11Y_CSS__"';
if (!rawJs.includes(placeholder)) {
  throw new Error("build.js: could not find the CSS placeholder in src/widget.js");
}
const jsWithCss = rawJs.replace(placeholder, JSON.stringify(minifiedCss));

const tmpEntry = path.join("dist", ".widget-with-css.js");
fs.writeFileSync(tmpEntry, jsWithCss);

esbuild.buildSync({
  entryPoints: [tmpEntry],
  outfile: "dist/widget.js",
  minify: true,
  target: "es2017"
});
fs.unlinkSync(tmpEntry);

// dist/widget.css is also published for reference (e.g. print stylesheets, manual overrides),
// but installs no longer require linking it — widget.js injects its own <style> tag.
fs.writeFileSync("dist/widget.css", minifiedCss);

console.log("Built dist/widget.js (CSS inlined) and dist/widget.css (reference copy)");
