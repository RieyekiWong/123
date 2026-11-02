import { parse } from "acorn";

const hasHan = /[\u3400-\u9fff]/;
export function inventory(files) {
  const rows = [];
  for (const [file, source] of Object.entries(files)) {
    const add = (text, line, kind) => {
      if (!hasHan.test(text)) return;
      for (const part of text.split(/<[^>]*>|\n/g)) {
        const value = part.trim();
        if (hasHan.test(value)) rows.push({ file, line, kind, text: value });
      }
    };
    if (file.endsWith(".js")) {
      let ast;
      try {
        ast = parse(source, {
          ecmaVersion: "latest",
          locations: true,
          sourceType: "script",
        });
      } catch (e) {
        throw Error(file + ": " + e.message);
      }
      const visit = (n) => {
        if (!n || typeof n !== "object") return;
        if (n.type === "Literal" && typeof n.value === "string")
          add(n.value, n.loc.start.line, "literal");
        if (n.type === "TemplateElement")
          add(n.value.cooked || n.value.raw, n.loc.start.line, "template");
        for (const [k, v] of Object.entries(n)) {
          if (["loc", "start", "end"].includes(k)) continue;
          if (Array.isArray(v)) v.forEach(visit);
          else if (typeof v === "object") visit(v);
        }
      };
      visit(ast);
    } else if (file.endsWith(".html")) {
      for (const m of source.matchAll(
        /(?:alt|aria-label|placeholder|title|content)="([^"]*)"/g,
      ))
        add(m[1], source.slice(0, m.index).split("\n").length, "attribute");
      source
        .split("\n")
        .forEach((line, i) => add(line.replace(/<[^>]*>/g, ""), i + 1, "html"));
    }
  }
  return rows;
}
