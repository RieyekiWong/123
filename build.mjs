import { mkdir, cp, rm } from "node:fs/promises";
import { V2_FILES } from "./site-files.mjs";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const path of [...V2_FILES, "assets"])
  await cp(path, `dist/${path}`, { recursive: true });
console.log("New edition built in dist/ — no archived game pages or scripts included.");
