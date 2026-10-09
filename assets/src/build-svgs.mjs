// Generates the profile README panels as self-contained SVGs.
// Usage: node assets/src/build-svgs.mjs [output-dir]   (defaults to assets/)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(outDir, { recursive: true });

const MONO = "'JetBrains Mono','Cascadia Mono','SF Mono',SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const SANS = "'Inter','Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif";

const C = {
  ink: "#0E1016",
  panel: "#161922",
  panelHi: "#1C2030",
  line: "#2A2F3D",
  text: "#F3F4F7",
  muted: "#98A0B3",
  red: "#E3350D",
  yellow: "#FFCB05",
  blue: "#3D7DCA",
  green: "#3DDC84",
  purple: "#A26BFA",
  orange: "#FF8A3D",
  screen: "#0B1120",
};

// Monospace glyphs are ~0.6em wide in every font of the stack; 0.61 leaves slack.
const monoWidth = (s, size) => s.length * size * 0.61;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const STYLE = `
  .mono{font-family:${MONO}}
  .sans{font-family:${SANS}}
  .flow{stroke-dasharray:6 18;animation:flow 1.4s linear infinite}
  .pulse{animation:pulse 1.8s ease-in-out infinite}
  .tw{animation:tw 3.2s ease-in-out infinite}
  .blink{animation:blink 1.1s steps(1) infinite}
  @keyframes flow{to{stroke-dashoffset:-24}}
  @keyframes pulse{50%{opacity:.25}}
  @keyframes tw{0%,100%{opacity:1}50%{opacity:.2}}
  @keyframes blink{50%{opacity:0}}
  @media (prefers-reduced-motion: reduce){.flow,.pulse,.tw,.blink{animation:none}}
`;

function svgDoc({ w, h, title, desc, body, defs = "" }) {
  // Every dotted ink panel gets a hairline edge so it stays defined on GitHub dark mode.
  body = body.replace(/<rect ([^>]*?) fill="url\(#dots\)"\/>/g, (m, a) => `${m}
<rect ${a} fill="none" stroke="${C.line}" stroke-width="2"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<defs>
<style>${STYLE}</style>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#FFFFFF" fill-opacity=".06"/></pattern>
${defs}
</defs>
${body}
</svg>
`;
}

function text(x, y, s, { size = 16, fill = C.text, cls = "mono", weight = 400, anchor = "start", spacing = 0, opacity = 1 } = {}) {
  return `<text x="${x}" y="${y}" class="${cls}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}"${opacity < 1 ? ` fill-opacity="${opacity}"` : ""}>${esc(s)}</text>`;
}

// Outlined chip with a colored square marker; returns markup and width.
function chip(x, y, label, { size = 16, color = C.yellow, h = 36, padX = 14, fill = "none", stroke = C.line, textFill = C.text } = {}) {
  const w = padX * 2 + 18 + monoWidth(label, size);
  const svg = `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  <rect x="${x + padX}" y="${y + h / 2 - 4}" width="8" height="8" fill="${color}"/>
  ${text(x + padX + 18, y + h / 2 + size * 0.35, label, { size, fill: textFill })}
</g>`;
  return { svg, w };
}

function chipRow(x, y, labels, opts = {}, gap = 12) {
  let cx = x;
  const parts = labels.map((l) => {
    const c = chip(cx, y, l.label ?? l, { ...opts, ...(l.color ? { color: l.color } : {}) });
    cx += c.w + gap;
    return c.svg;
  });
  return { svg: parts.join("\n"), end: cx - gap };
}

// ---------------------------------------------------------------- header
function header() {
  const W = 1200, H = 360;
  const roles = chipRow(64, 292, [
    { label: "LEAD DEVELOPER · CMREJECTS", color: C.red },
    { label: "AUTOMATION SPECIALIST", color: C.blue },
    { label: "AD CYBERSECURITY · HVA", color: C.yellow },
  ]);

  // Deterministic "activity" constellation on a pixel grid.
  const cols = 9, rows = 8, step = 26, size = 22, gx = 900, gy = 64;
  const palette = [C.red, C.yellow, C.blue, C.green];
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = (r * 7 + c * 13 + r * c * 5) % 11;
      const x = gx + c * step, y = gy + r * step;
      if (n === 0 || n === 4) {
        const color = palette[(r + c) % palette.length];
        const delay = ((r * cols + c) % 8) * 0.4;
        cells.push(`<rect class="tw" style="animation-delay:${delay}s" x="${x}" y="${y}" width="${size}" height="${size}" rx="3" fill="${color}"/>`);
      } else {
        cells.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="3" fill="#FFFFFF" fill-opacity=".045"/>`);
      }
    }
  }

  const body = `
<clipPath id="hc"><rect width="${W}" height="${H}" rx="20"/></clipPath>
<g clip-path="url(#hc)">
  <rect width="${W}" height="${H}" fill="${C.ink}"/>
  <rect width="${W}" height="${H}" rx="20" fill="url(#dots)"/>
  <circle cx="1080" cy="40" r="260" fill="url(#glowRed)"/>
  <circle cx="80" cy="380" r="260" fill="url(#glowBlue)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${C.red}"/>
  <rect x="0" y="0" width="420" height="6" fill="${C.yellow}"/>
</g>
${text(64, 84, "MDG DEVELOPMENTS · SINCE OCT 2026", { size: 17, fill: C.yellow, spacing: 3, weight: 700 })}
${text(60, 172, "Mika de Geus", { size: 88, cls: "sans", weight: 800, spacing: -2 })}
${text(64, 220, "I build and run systems end to end: server software, web apps,", { size: 24, cls: "sans", fill: C.muted })}
${text(64, 252, "the infrastructure underneath and the automation in between.", { size: 24, cls: "sans", fill: C.muted })}
${roles.svg}
${cells.join("\n")}
<rect class="blink" x="${roles.end + 16}" y="296" width="14" height="28" fill="${C.text}"/>
`;
  const defs = `
<radialGradient id="glowRed"><stop offset="0" stop-color="${C.red}" stop-opacity=".28"/><stop offset="1" stop-color="${C.red}" stop-opacity="0"/></radialGradient>
<radialGradient id="glowBlue"><stop offset="0" stop-color="${C.blue}" stop-opacity=".22"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>`;
  return svgDoc({
    w: W, h: H, defs, body,
    title: "Mika de Geus",
    desc: "Mika de Geus, owner of MDG Developments since October 2026. Lead Developer at Cobblemon Rejects, Automation Specialist, AD Cybersecurity student at HvA. Builds and runs systems end to end: server software, web apps, the infrastructure underneath and the automation in between.",
  });
}

// ---------------------------------------------------------------- what I do
function whatIDo() {
  const W = 1200, H = 440;
  const card = (x, y, w, h, accent) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${C.ink}"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="url(#dots)"/>
<rect x="${x + 28}" y="${y}" width="64" height="5" fill="${accent}"/>`;

  const gameItems = [
    "Velocity proxy and 5 Fabric backends",
    "15 custom server-side mods in Java 21",
    "Cross-server sync: Redis, MariaDB, MongoDB",
    "Docker ops, encrypted backups, 2FA",
    "A Discord bot for the community",
  ];
  const gameRows = gameItems.map((item, i) => {
    const y = 170 + i * 52;
    return `<rect x="28" y="${y - 27}" width="532" height="42" rx="10" fill="${C.panelHi}"/>
${text(48, y, `0${i + 1}`, { size: 16, weight: 700, fill: C.red })}
${text(92, y + 1, item, { size: 20, cls: "sans", weight: 600 })}`;
  });

  const processes = ["Bank statement checks", "Email handling", "Business credit proposals"];
  const procRows = processes.map((p, i) =>
    `${text(640, 130 + i * 28, `0${i + 1}`, { size: 16, weight: 700, fill: C.blue })}
${text(684, 130 + i * 28, p, { size: 17 })}`);

  const body = `
${card(0, 0, 588, H, C.red)}
${text(28, 52, "GAME SERVERS & INFRA", { size: 16, fill: C.red, spacing: 3, weight: 700 })}
${text(28, 94, "Lead Developer", { size: 34, cls: "sans", weight: 800 })}
${text(28, 122, "Cobblemon Rejects · Minecraft network", { size: 16, fill: C.muted })}
${gameRows.join("\n")}

${card(612, 0, 588, 212, C.blue)}
${text(640, 52, "AUTOMATION SPECIALIST", { size: 16, fill: C.blue, spacing: 3, weight: 700 })}
${text(640, 90, "Financial services · lending", { size: 28, cls: "sans", weight: 800 })}
${procRows.join("\n")}

${card(612, 228, 288, 212, C.orange)}
${text(640, 280, "SECURITY", { size: 16, fill: C.orange, spacing: 3, weight: 700 })}
${text(640, 306, "AD CYBERSECURITY · HVA", { size: 14, fill: C.muted })}
${text(640, 346, "Pentesting · OSINT", { size: 20, cls: "sans", weight: 600 })}
${text(640, 376, "Risk analysis", { size: 20, cls: "sans", weight: 600 })}
${text(640, 406, "Network · OT/ICS", { size: 20, cls: "sans", weight: 600 })}

${card(912, 228, 288, 212, C.yellow)}
${text(940, 280, "WEB", { size: 16, fill: C.yellow, spacing: 3, weight: 700 })}
${text(940, 340, "Studio Lumeza", { size: 28, cls: "sans", weight: 800 })}
${text(940, 372, "Website · Astro", { size: 15, fill: C.muted })}
${text(940, 396, "Client work", { size: 15, fill: C.muted })}
`;
  return svgDoc({
    w: W, h: H, body,
    title: "What I do",
    desc: "Game servers and infrastructure: Lead Developer at Cobblemon Rejects, a Minecraft network. A Velocity proxy and 5 Fabric backends, 15 custom server-side mods in Java 21, cross-server sync over Redis, MariaDB and MongoDB, Docker operations with encrypted backups and 2FA, and a Discord bot for the community. Automation Specialist in financial services (lending): bank statement checks, email handling and business credit proposals. Security, AD Cybersecurity at HvA: pentesting, OSINT, risk analysis, network and OT/ICS security. Web: the Studio Lumeza website, built with Astro as client work.",
  });
}

// ---------------------------------------------------------------- pokedex
function pokedex() {
  const W = 1200, H = 560;

  const backends = [
    { name: "HUB", color: C.yellow },
    { name: "PEACEFUL", color: C.green },
    { name: "HARD", color: C.red },
    { name: "RESOURCE", color: C.blue },
    { name: "ADVENTURE", color: C.purple },
  ];
  const bx = 470, bw = 170, bh = 34, by0 = 262, bstep = 42;
  const midY = by0 + (bstep * (backends.length - 1)) / 2 + bh / 2;
  const busX = 664;

  const backendNodes = backends.map((b, i) => {
    const y = by0 + i * bstep, cy = y + bh / 2;
    return `<g>
  <rect x="${bx}" y="${y}" width="${bw}" height="${bh}" rx="7" fill="${C.panelHi}" stroke="#FFFFFF" stroke-opacity=".14"/>
  <rect x="${bx}" y="${y}" width="7" height="${bh}" rx="2" fill="${b.color}"/>
  ${text(bx + 22, cy + 6, b.name, { size: 16, weight: 700 })}
</g>`;
  });
  const proxyEdges = backends.map((_, i) => `M406 ${midY} H438 V${by0 + i * bstep + bh / 2} H${bx}`);
  const busEdges = backends.map((_, i) => `M${bx + bw} ${by0 + i * bstep + bh / 2} H${busX}`);

  const stores = [
    { name: "REDIS", color: "#E5534B" },
    { name: "MARIADB", color: "#C9A26B" },
    { name: "MONGODB", color: C.green },
  ];
  const sx = 694, sw = 112;
  const storeYs = [midY - 68, midY, midY + 68];
  const storeNodes = stores.map((s, i) => {
    const top = storeYs[i] - 22;
    return `<g>
  <path d="M${sx} ${top + 7} V${top + 37} A${sw / 2} 7 0 0 0 ${sx + sw} ${top + 37} V${top + 7}" fill="${C.panelHi}" stroke="${s.color}" stroke-width="2"/>
  <ellipse cx="${sx + sw / 2}" cy="${top + 7}" rx="${sw / 2}" ry="7" fill="${C.panelHi}" stroke="${s.color}" stroke-width="2"/>
  ${text(sx + sw / 2, top + 32, s.name, { size: 14, weight: 700, anchor: "middle" })}
</g>`;
  });
  const storeEdges = storeYs.map((y) => `M${busX} ${y + 4} H${sx}`);

  const edge = (d, color) =>
    `<path d="${d}" fill="none" stroke="#2C3852" stroke-width="3"/><path class="flow" d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;

  const built = [
    ["ARCHITECTURE", "Proxy + 5 Fabric backends"],
    ["CUSTOM MODS", "15 mods in Java 21"],
    ["SYNC LAYER", "Redis · MariaDB · MongoDB"],
    ["OPERATIONS", "Docker · backups · 2FA"],
  ];
  const builtRows = built.map(([label, value], i) => {
    const y = 262 + i * 52;
    return `${text(846, y, label, { size: 14, fill: C.muted, spacing: 1 })}
${text(846, y + 24, value, { size: 19, cls: "sans", weight: 700 })}`;
  });

  const body = `
<rect width="${W}" height="${H}" rx="28" fill="url(#shell)"/>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="22" fill="none" stroke="#FFFFFF" stroke-opacity=".18" stroke-width="2"/>
<path d="M28 150 H640 L684 140 H1172" fill="none" stroke="#000000" stroke-opacity=".28" stroke-width="3"/>

<circle cx="88" cy="76" r="46" fill="#F4F4F6" stroke="#000000" stroke-opacity=".3" stroke-width="3"/>
<circle cx="88" cy="76" r="36" fill="url(#lens)"/>
<ellipse cx="75" cy="61" rx="11" ry="7" fill="#FFFFFF" fill-opacity=".7"/>
<circle cx="164" cy="38" r="9" fill="#FF4B4B" stroke="#000000" stroke-opacity=".35" stroke-width="2"/>
<circle cx="190" cy="38" r="9" fill="${C.yellow}" stroke="#000000" stroke-opacity=".35" stroke-width="2"/>
<circle class="pulse" cx="216" cy="38" r="9" fill="${C.green}" stroke="#000000" stroke-opacity=".35" stroke-width="2"/>

${text(158, 98, "Cobblemon Rejects", { size: 42, cls: "sans", weight: 800 })}
${text(160, 128, "MY ROLE: LEAD DEVELOPER · ARCHITECTURE, MODS AND OPERATIONS", { size: 16, fill: "#FFFFFF", opacity: 0.85, spacing: 1 })}

<rect x="902" y="54" width="246" height="40" rx="20" fill="#000000" fill-opacity=".28"/>
<rect x="924" y="68" width="12" height="12" fill="${C.yellow}"/>
${text(948, 80, "FEATURED PROJECT", { size: 16, weight: 700, spacing: 1 })}

<rect x="40" y="164" width="1120" height="330" rx="18" fill="#E9E9EE"/>
<circle cx="580" cy="180" r="5" fill="${C.red}"/>
<circle cx="620" cy="180" r="5" fill="${C.red}"/>
<rect x="64" y="194" width="1072" height="286" rx="10" fill="${C.screen}"/>
<rect x="64" y="194" width="1072" height="286" rx="10" fill="url(#scan)"/>

${text(88, 226, "ROUTE MAP", { size: 15, fill: C.yellow, spacing: 3, weight: 700 })}
${text(470, 248, "PURE FABRIC 1.21.1", { size: 13, fill: C.muted, spacing: 1 })}
${text(694, 248, "SHARED STATE", { size: 13, fill: C.muted, spacing: 1 })}
<line x1="822" y1="212" x2="822" y2="462" stroke="#FFFFFF" stroke-opacity=".08" stroke-width="2"/>
${text(846, 226, "WHAT I BUILT", { size: 15, fill: C.yellow, spacing: 3, weight: 700 })}

${edge(`M216 ${midY} H256`, C.blue)}
${proxyEdges.map((d) => edge(d, C.blue)).join("\n")}
<path d="M${busX} ${by0 + bh / 2} V${by0 + 4 * bstep + bh / 2}" stroke="#2C3852" stroke-width="3"/>
${busEdges.map((d) => edge(d, C.yellow)).join("\n")}
${storeEdges.map((d) => edge(d, C.yellow)).join("\n")}

<rect x="96" y="${midY - 20}" width="120" height="40" rx="20" fill="${C.screen}" stroke="${C.yellow}" stroke-width="2"/>
${text(156, midY + 6, "PLAYERS", { size: 15, weight: 700, anchor: "middle" })}
<rect x="256" y="${midY - 30}" width="150" height="60" rx="8" fill="${C.panelHi}" stroke="${C.blue}" stroke-width="2"/>
${text(331, midY - 2, "VELOCITY", { size: 17, weight: 700, anchor: "middle" })}
${text(331, midY + 18, "single entry", { size: 13, fill: C.muted, anchor: "middle" })}
${backendNodes.join("\n")}
${storeNodes.join("\n")}

${builtRows.join("\n")}

<rect x="56" y="512" width="12" height="12" fill="${C.yellow}"/>
${text(80, 524, "THE HARD PART", { size: 15, weight: 800, fill: C.yellow, spacing: 2 })}
${text(236, 525, "a version-guarded Redis handoff, so switching worlds never rolls a player back.", { size: 19, cls: "sans", weight: 600 })}
<circle cx="1112" cy="518" r="14" fill="#1B1D24"/>
<circle cx="1146" cy="518" r="14" fill="#1B1D24"/>
`;
  const defs = `
<linearGradient id="shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EA4220"/><stop offset="1" stop-color="#B8290B"/></linearGradient>
<radialGradient id="lens" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#8FD0FF"/><stop offset=".55" stop-color="#3D7DCA"/><stop offset="1" stop-color="#1B3F7A"/></radialGradient>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#FFFFFF" fill-opacity=".035"/></pattern>`;
  return svgDoc({
    w: W, h: H, defs, body,
    title: "Featured project: Cobblemon Rejects",
    desc: "Featured project: Cobblemon Rejects, a Minecraft network where my role is lead developer, covering architecture, mods and operations. Players connect through a single Velocity proxy that routes them to five pure Fabric 1.21.1 backends: hub, peaceful, hard, resource and adventure. Shared state lives in Redis, MariaDB and MongoDB. What I built: the architecture (proxy and five Fabric backends), 15 custom mods in Java 21, the sync layer over Redis, MariaDB and MongoDB, and the operations with Docker, backups and 2FA. The hard part: a version-guarded Redis handoff, so switching worlds never rolls a player back.",
  });
}

// ---------------------------------------------------------------- toolbox
function toolbox() {
  const W = 1200;
  const groups = [
    { label: "LANGUAGES", color: C.yellow, items: ["Java", "TypeScript", "JavaScript", "Python", "SQL", "Bash"] },
    { label: "GAME SERVERS", color: C.red, items: ["Fabric", "Velocity", "Paper", "Gradle", "JUnit 5", "LuckPerms"] },
    { label: "WEB", color: C.blue, items: ["Astro", "React", "Next.js", "Express", "Vite", "Tailwind CSS", "Prisma", "Firebase"] },
    { label: "DATA & INFRA", color: C.green, items: ["Redis", "MariaDB", "MongoDB", "Docker", "Linux", "Caddy", "Nginx", "Cloudflare"] },
    { label: "AUTOMATION", color: C.purple, items: ["n8n", "Puppeteer", "Python scripting"] },
    { label: "SECURITY", color: C.orange, items: ["Burp Suite", "nmap", "Wireshark", "Scapy", "Authelia", "OWASP", "ISO 27001", "MITRE ATT&CK"] },
  ];
  const left = 56, chipsX = 268, right = W - 56, rowH = 46, size = 15;
  let y = 104;
  const rows = groups.map((g) => {
    const startY = y;
    let x = chipsX;
    const chips = g.items.map((it) => {
      const w = monoWidth(it, size) + 28;
      if (x + w > right) { x = chipsX; y += rowH; }
      const s = `<rect x="${x}" y="${y}" width="${w}" height="34" rx="6" fill="${C.panelHi}" stroke="${g.color}" stroke-opacity=".45" stroke-width="1.5"/>
${text(x + 14, y + 22, it, { size })}`;
      x += w + 10;
      return s;
    });
    const label = `<rect x="${left}" y="${startY + 13}" width="8" height="8" fill="${g.color}"/>
${text(left + 20, startY + 22, g.label, { size: 15, fill: C.muted, spacing: 2, weight: 700 })}`;
    y += rowH + 10;
    return label + "\n" + chips.join("\n");
  });
  const H = y + 30;
  const body = `
<rect width="${W}" height="${H}" rx="20" fill="${C.ink}"/>
<rect width="${W}" height="${H}" rx="20" fill="url(#dots)"/>
${text(56, 62, "TOOLBOX", { size: 16, fill: C.yellow, spacing: 3, weight: 700 })}
${rows.join("\n")}
`;
  return svgDoc({
    w: W, h: H, body,
    title: "Toolbox",
    desc: groups.map((g) => `${g.label}: ${g.items.join(", ")}.`).join(" "),
  });
}

const files = { "header.svg": header(), "what-i-do.svg": whatIDo(), "cmrejects.svg": pokedex(), "toolbox.svg": toolbox() };
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(outDir, name), svg);
  console.log(`${name}  ${(svg.length / 1024).toFixed(1)} KB`);
}
