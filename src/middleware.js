// Just a small tool to mimic the vercel redirects behaviour loaclly
import { readFileSync } from "node:fs";

function escapeRegex(str) {
  return str.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
}

function parse(source) {
  const params = [];
  let reStr = "";
  let i = 0;
  const re = /:(\w+)(?:\(([^)]*)\))?/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    reStr += escapeRegex(source.slice(i, m.index).replace(/\\(.)/g, "$1"));
    reStr += m[2] ? `(${m[2]})` : "([^/]+)";
    params.push(m[1]);
    i = re.lastIndex;
  }
  reStr += escapeRegex(source.slice(i).replace(/\\(.)/g, "$1"));
  return { re: new RegExp(`^${reStr}$`), params };
}

function fill(destination, params, values) {
  return params.reduce(
    (s, name, i) => s.replace(new RegExp(`:${name}`, "g"), values[i]),
    destination,
  );
}

const vercelConfig = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf-8"),
);

const simpleRedirects = {};
const patternRedirects = [];

for (const r of vercelConfig.redirects) {
  if (!r.source.includes("(") && !r.source.includes(":")) {
    simpleRedirects[r.source] = r.destination;
    if (r.source.endsWith("/")) {
      simpleRedirects[r.source.replace(/\/$/, "")] = r.destination;
    } else if (r.source !== "/") {
      simpleRedirects[r.source + "/"] = r.destination;
    }
  } else {
    const parsed = parse(r.source);
    patternRedirects.push({ ...parsed, destination: r.destination });
  }
}

export function onRequest(context, next) {
  const pathname = new URL(context.request.url).pathname;

  const target = simpleRedirects[pathname];
  if (target) return context.redirect(target, 301);

  for (const { re, params, destination } of patternRedirects) {
    const m = pathname.match(re);
    if (m) {
      return context.redirect(fill(destination, params, m.slice(1)), 301);
    }
  }

  return next();
}
