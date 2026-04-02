#!/usr/bin/env bun
// Claude Code Buddy Designer — Interactive TUI with animation
// Requires: bun (native CC) or node 18+ (npm CC)
// Usage: bun buddy-designer.mjs  OR  node buddy-designer.mjs

import { readFileSync, writeFileSync, existsSync, utimesSync, unlinkSync, realpathSync } from "fs";
import { join, dirname } from "path";
import { execSync } from "child_process";
import { createHash, randomBytes } from "crypto";
import { fileURLToPath } from "url";

// Requires bun
if (typeof globalThis.Bun === "undefined") {
  console.error("Run with: bun buddy-designer.mjs");
  process.exit(1);
}

// Find config file using same logic as Claude Code
function findClaudeConfig() {
  const configDir = process.env.CLAUDE_CONFIG_DIR || join(process.env.HOME, ".claude");
  const legacy = join(configDir, ".config.json");
  if (existsSync(legacy)) return legacy;
  let suffix = "";
  if (process.env.CLAUDE_CODE_CUSTOM_OAUTH_URL) suffix = "-custom-oauth";
  const dir = process.env.CLAUDE_CONFIG_DIR || process.env.HOME;
  return join(dir, `.claude${suffix}.json`);
}

const homeJson = findClaudeConfig();

// Detect CC install type: native (bun binary) or npm (node)
let ccIsNative = true;
try {
  const ccPath = execSync("which claude", { encoding: "utf8", stdio: ["pipe","pipe","ignore"] }).trim();
  const resolved = execSync(`readlink -f "${ccPath}" 2>/dev/null || readlink "${ccPath}" 2>/dev/null || echo "${ccPath}"`, { encoding: "utf8", stdio: ["pipe","pipe","ignore"] }).trim();
  if (resolved.includes("node_modules") || resolved.endsWith(".js") || resolved.endsWith(".cjs")) {
    ccIsNative = false;
  }
  try {
    const head = readFileSync(resolved, "utf8").slice(0, 100);
    if (head.startsWith("#!/") && (head.includes("node") || head.includes("npx"))) ccIsNative = false;
  } catch {}
} catch {}

// Hash — native CC uses Bun.hash, npm CC uses FNV-1a
function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function bunHash(str) {
  return ccIsNative ? Number(BigInt(Bun.hash(str)) & 0xFFFFFFFFn) : fnv1a(str);
}
const scriptDir = dirname(fileURLToPath(import.meta.url));
const legendaryLog = join(process.env.HOME, ".claude", "buddy-legendaries.json");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SALT = "friend-2026-401";

// ── Constants ──
const SPECIES = ["duck","goose","blob","cat","dragon","octopus","owl","penguin","turtle","snail","ghost","axolotl","capybara","cactus","robot","rabbit","mushroom","chonk"];
const EYES = ["·","✦","×","◉","@","°"];
const HATS = ["none","crown","tophat","propeller","halo","wizard","beanie","tinyduck"];
const STAT_NAMES = ["DEBUGGING","PATIENCE","CHAOS","WISDOM","SNARK"];
const RARITY_FLOOR = {common:5,uncommon:15,rare:25,epic:35,legendary:50};
const RARITIES = ["common","uncommon","rare","epic","legendary"];
const RARITY_WEIGHTS = {common:60,uncommon:25,rare:10,epic:4,legendary:1};
const FALLBACK_NAMES = ["Crumpet","Soup","Pickle","Biscuit","Moth","Gravy"];

// ── Sprites (all 3 frames) ──
const B = {
duck:[
[`            `,`    __      `,`  <({E} )___  `,`   (  ._>   `,`    \`--´    `],
[`            `,`    __      `,`  <({E} )___  `,`   (  ._>   `,`    \`--´~   `],
[`            `,`    __      `,`  <({E} )___  `,`   (  .__>  `,`    \`--´    `]],
goose:[
[`            `,`     ({E}>    `,`     ||     `,`   _(__)_   `,`    ^^^^    `],
[`            `,`    ({E}>     `,`     ||     `,`   _(__)_   `,`    ^^^^    `],
[`            `,`     ({E}>>   `,`     ||     `,`   _(__)_   `,`    ^^^^    `]],
blob:[
[`            `,`   .----.   `,`  ( {E}  {E} )  `,`  (      )  `,`   \`----´   `],
[`            `,`  .------.  `,` (  {E}  {E}  ) `,` (        ) `,`  \`------´  `],
[`            `,`    .--.    `,`   ({E}  {E})   `,`   (    )   `,`    \`--´    `]],
cat:[
[`            `,`   /\\_/\\    `,`  ( {E}   {E})  `,`  (  ω  )   `,`  (")_(")   `],
[`            `,`   /\\_/\\    `,`  ( {E}   {E})  `,`  (  ω  )   `,`  (")_(")~  `],
[`            `,`   /\\-/\\    `,`  ( {E}   {E})  `,`  (  ω  )   `,`  (")_(")   `]],
dragon:[
[`            `,`  /^\\  /^\\  `,` <  {E}  {E}  > `,` (   ~~   ) `,`  \`-vvvv-´  `],
[`            `,`  /^\\  /^\\  `,` <  {E}  {E}  > `,` (        ) `,`  \`-vvvv-´  `],
[`   ~    ~   `,`  /^\\  /^\\  `,` <  {E}  {E}  > `,` (   ~~   ) `,`  \`-vvvv-´  `]],
octopus:[
[`            `,`   .----.   `,`  ( {E}  {E} )  `,`  (______)  `,`  /\\/\\/\\/\\  `],
[`            `,`   .----.   `,`  ( {E}  {E} )  `,`  (______)  `,`  \\/\\/\\/\\/  `],
[`     o      `,`   .----.   `,`  ( {E}  {E} )  `,`  (______)  `,`  /\\/\\/\\/\\  `]],
owl:[
[`            `,`   /\\  /\\   `,`  (({E})({E}))  `,`  (  ><  )  `,`   \`----´   `],
[`            `,`   /\\  /\\   `,`  (({E})({E}))  `,`  (  ><  )  `,`   .----.   `],
[`            `,`   /\\  /\\   `,`  (({E})(-))  `,`  (  ><  )  `,`   \`----´   `]],
penguin:[
[`            `,`  .---.     `,`  ({E}>{E})     `,` /(   )\\    `,`  \`---´     `],
[`            `,`  .---.     `,`  ({E}>{E})     `,` |(   )|    `,`  \`---´     `],
[`  .---.     `,`  ({E}>{E})     `,` /(   )\\    `,`  \`---´     `,`   ~ ~      `]],
turtle:[
[`            `,`   _,--._   `,`  ( {E}  {E} )  `,` /[______]\\ `,`  \`\`    \`\`  `],
[`            `,`   _,--._   `,`  ( {E}  {E} )  `,` /[______]\\ `,`   \`\`  \`\`   `],
[`            `,`   _,--._   `,`  ( {E}  {E} )  `,` /[======]\\ `,`  \`\`    \`\`  `]],
snail:[
[`            `,` {E}    .--.  `,`  \\  ( @ )  `,`   \\_\`--´   `,`  ~~~~~~~   `],
[`            `,`  {E}   .--.  `,`  |  ( @ )  `,`   \\_\`--´   `,`  ~~~~~~~   `],
[`            `,` {E}    .--.  `,`  \\  ( @  ) `,`   \\_\`--´   `,`   ~~~~~~   `]],
ghost:[
[`            `,`   .----.   `,`  / {E}  {E} \\  `,`  |      |  `,`  ~\`~\`\`~\`~  `],
[`            `,`   .----.   `,`  / {E}  {E} \\  `,`  |      |  `,`  \`~\`~~\`~\`  `],
[`    ~  ~    `,`   .----.   `,`  / {E}  {E} \\  `,`  |      |  `,`  ~~\`~~\`~~  `]],
axolotl:[
[`            `,`}~(______)~{`,`}~({E} .. {E})~{`,`  ( .--. )  `,`  (_/  \\_)  `],
[`            `,`~}(______){~`,`~}({E} .. {E}){~`,`  ( .--. )  `,`  (_/  \\_)  `],
[`            `,`}~(______)~{`,`}~({E} .. {E})~{`,`  (  --  )  `,`  ~_/  \\_~  `]],
capybara:[
[`            `,`  n______n  `,` ( {E}    {E} ) `,` (   oo   ) `,`  \`------´  `],
[`            `,`  n______n  `,` ( {E}    {E} ) `,` (   Oo   ) `,`  \`------´  `],
[`    ~  ~    `,`  u______n  `,` ( {E}    {E} ) `,` (   oo   ) `,`  \`------´  `]],
cactus:[
[`            `,` n  ____  n `,` | |{E}  {E}| | `,` |_|    |_| `,`   |    |   `],
[`            `,`    ____    `,` n |{E}  {E}| n `,` |_|    |_| `,`   |    |   `],
[` n        n `,` |  ____  | `,` | |{E}  {E}| | `,` |_|    |_| `,`   |    |   `]],
robot:[
[`            `,`   .[||].   `,`  [ {E}  {E} ]  `,`  [ ==== ]  `,`  \`------´  `],
[`            `,`   .[||].   `,`  [ {E}  {E} ]  `,`  [ -==- ]  `,`  \`------´  `],
[`     *      `,`   .[||].   `,`  [ {E}  {E} ]  `,`  [ ==== ]  `,`  \`------´  `]],
rabbit:[
[`            `,`   (\\__/)   `,`  ( {E}  {E} )  `,` =(  ..  )= `,`  (")__(")  `],
[`            `,`   (|__/)   `,`  ( {E}  {E} )  `,` =(  ..  )= `,`  (")__(")  `],
[`            `,`   (\\__/)   `,`  ( {E}  {E} )  `,` =( .  . )= `,`  (")__(")  `]],
mushroom:[
[`            `,` .-o-OO-o-. `,`(__________)`,`   |{E}  {E}|   `,`   |____|   `],
[`            `,` .-O-oo-O-. `,`(__________)`,`   |{E}  {E}|   `,`   |____|   `],
[`   . o  .   `,` .-o-OO-o-. `,`(__________)`,`   |{E}  {E}|   `,`   |____|   `]],
chonk:[
[`            `,`  /\\    /\\  `,` ( {E}    {E} ) `,` (   ..   ) `,`  \`------´  `],
[`            `,`  /\\    /|  `,` ( {E}    {E} ) `,` (   ..   ) `,`  \`------´  `],
[`            `,`  /\\    /\\  `,` ( {E}    {E} ) `,` (   ..   ) `,`  \`------´~ `]],
};
const HL = {none:"",crown:"   \\^^^/    ",tophat:"   [___]    ",propeller:"    -+-     ",halo:"   (   )    ",wizard:"    /^\\     ",beanie:"   (___)    ",tinyduck:"    ,>      "};

function renderSprite(species, eye, hat, frame=0, blink=false) {
  const frames = B[species];
  const body = frames[frame % frames.length].map(l => {
    let line = l.replaceAll("{E}", eye);
    if (blink) line = line.replaceAll(eye, "-");
    return line;
  });
  const lines = [...body];
  // Apply hat to line 0 if empty
  if (hat !== "none" && !lines[0].trim()) lines[0] = HL[hat];
  // Always return exactly 5 lines (fixed height)
  while (lines.length < 5) lines.push("            ");
  return lines.slice(0, 5);
}

// ── Algorithm ──
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function rollRarity(rng) {
  const total = Object.values(RARITY_WEIGHTS).reduce((a,b)=>a+b,0);
  let roll = rng() * total;
  for (const r of RARITIES) { roll -= RARITY_WEIGHTS[r]; if (roll < 0) return r; }
  return "common";
}
function rollStats(rng, rarity) {
  const floor = RARITY_FLOOR[rarity];
  const peak = pick(rng, STAT_NAMES); let dump = pick(rng, STAT_NAMES);
  while (dump === peak) dump = pick(rng, STAT_NAMES);
  const stats = {};
  for (const n of STAT_NAMES) {
    if (n === peak) stats[n] = Math.min(100, floor + 50 + Math.floor(rng() * 30));
    else if (n === dump) stats[n] = Math.max(1, floor - 10 + Math.floor(rng() * 15));
    else stats[n] = floor + Math.floor(rng() * 40);
  }
  return stats;
}
function rollBuddy(uid) {
  const key = uid + SALT;
  const hash = bunHash(key);
  const rng = mulberry32(hash);
  const rarity = rollRarity(rng);
  const species = pick(rng, SPECIES);
  const eye = pick(rng, EYES);
  const hat = rarity === "common" ? "none" : pick(rng, HATS);
  const shiny = rng() < 0.01;
  const stats = rollStats(rng, rarity);
  const nameIdx = (species.charCodeAt(0) + eye.charCodeAt(0)) % FALLBACK_NAMES.length;
  return { rarity, species, eye, hat, shiny, stats, name: FALLBACK_NAMES[nameIdx] };
}
function genUserId() {
  return createHash("sha256").update(randomBytes(32)).digest("hex");
}
// Write config with retry — CC might overwrite our change, so verify and retry
function writeConfig(data) {
  const uid = data.userID;
  for (let attempt = 0; attempt < 5; attempt++) {
    writeFileSync(homeJson, JSON.stringify(data, null, 2));
    // Set mtime to future so CC's freshness watcher picks it up
    const future = new Date(Date.now() + 2000);
    utimesSync(homeJson, future, future);
    // Verify it stuck
    execSync("sleep 0.2");
    const check = JSON.parse(readFileSync(homeJson, "utf8"));
    if (check.userID === uid) return; // success
    // CC overwrote us — re-read, re-apply, retry
    data = check;
    data.userID = uid;
  }
}

// ── Terminal ──
const w = (s) => process.stdout.write(s);
const mv = (r,c) => w(`\x1b[${r};${c}H`);
const clr = () => w("\x1b[2J\x1b[H\x1b[?25l"); // full clear (only on first draw)
const home = () => w("\x1b[H\x1b[?25l"); // move to top without clearing
const clearLine = () => w("\x1b[2K"); // clear current line
const show_cursor = () => w("\x1b[?25h");
const X = "\x1b[0m", BD = "\x1b[1m", DM = "\x1b[2m", IV = "\x1b[7m";
const GD = "\x1b[33;1m", GN = "\x1b[32;1m", CY = "\x1b[36m", MG = "\x1b[35m";
const LEFT_W = 30, RIGHT_C = 45;

// ── State ──
// Fields: 0=species, 1=eye, 2=hat, 3=shiny, 4=START, 5+=saved entries
let selField = 0, selSpecies = 0, selEye = 0, selHat = 0, selShiny = 0;
let mode = "design", rollCount = 0, tick = 0;
let foundBuddy = null, foundUid = null, prevStats = null;
let savedEntries = [];
let currentUid = "";
let renameBuffer = ""; // Buffer for rename input
const SHINY_OPTS = ["off", "on"];
// Reroll setup state
let rerollCursor = 0; // 0-4: which stat is highlighted in setup mode
let rerollDirs = [1, 1, -1, 1, -1]; // 1=up, -1=down. Defaults: DEBUG↑ PAT↑ CHAOS↓ WIS↑ SNARK↓
const REROLL_DIR_DEFAULTS = [1, 1, -1, 1, -1];
// Same idle sequence as Claude Code
const IDLE_SEQUENCE = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0];

// Load saved
try { if (existsSync(legendaryLog)) savedEntries = JSON.parse(readFileSync(legendaryLog, "utf8")); } catch {}
try {
  const d = JSON.parse(readFileSync(homeJson, "utf8"));
  // Same priority as Claude Code: oauthAccount.accountUuid > userID > 'anon'
  currentUid = d.oauthAccount?.accountUuid || d.userID || "";
  if (currentUid) {
    const b = rollBuddy(currentUid);
    const si = SPECIES.indexOf(b.species); if (si >= 0) selSpecies = si;
    const ei = EYES.indexOf(b.eye); if (ei >= 0) selEye = ei;
    const hi = HATS.indexOf(b.hat); if (hi >= 0) selHat = hi;
  }
} catch {}

// ── TTY input (async, non-blocking) ──
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

let keyQueue = [];
process.stdin.on("data", (data) => {
  if (mode === "rename") {
    // In rename mode, capture text input
    if (data[0] === "\r" || data[0] === "\n") keyQueue.push("rename_confirm");
    else if (data[0] === "\x1b" || data[0] === "\x03") keyQueue.push("rename_cancel");
    else if (data[0] === "\x7f" || data[0] === "\b") keyQueue.push("rename_backspace");
    else if (data.charCodeAt(0) >= 32 && !data.startsWith("\x1b[")) keyQueue.push("rename_char:" + data);
    return;
  }
  if (data.startsWith("\x1b[A")) keyQueue.push("up");
  else if (data.startsWith("\x1b[B")) keyQueue.push("down");
  else if (data.startsWith("\x1b[C")) keyQueue.push("right");
  else if (data.startsWith("\x1b[D")) keyQueue.push("left");
  else if (data[0] === "\r" || data[0] === "\n" || data[0] === " ") keyQueue.push("enter");
  else if (data[0] === "q" || data[0] === "\x03") keyQueue.push("quit");
  else if (data[0] === "d" || data[0] === "x") keyQueue.push("delete");
  else if (data[0] === "r") keyQueue.push("reroll");
  else if (data[0] === "n") keyQueue.push("rename");
});

function pollKey() {
  return keyQueue.shift() || null;
}

// ── Draw ──
function draw() {
  home(); // move to top, no clear — eliminates flicker
  const sp = SPECIES[selSpecies];
  const eye = EYES[selEye];
  const hat = HATS[selHat];
  // If viewing a saved entry, show its sprite instead
  let previewSp = sp, previewEye = eye, previewHat = hat;
  if (selField >= 5 && savedEntries[selField - 5]) {
    const e = savedEntries[selField - 5];
    previewSp = e.species || sp;
    previewEye = e.eye || eye;
    previewHat = e.hat || hat;
  }
  // Idle animation — same as Claude Code
  const step = IDLE_SEQUENCE[tick % IDLE_SEQUENCE.length];
  const spriteFrame = step === -1 ? 0 : step;
  const blink = step === -1;
  const sprite = renderSprite(previewSp, previewEye, previewHat, spriteFrame, blink);

  // Title
  mv(1, 1); w(`${GD}${BD}  ✦ Claude Code Buddy Designer ✦${X}`);
  // Help box — 3 columns, use mv() for precise alignment
  const HK = 4, HD = 11, HK2 = 30, HD2 = 37, HK3 = 56, HD3 = 63;
  mv(2, 1); w(`${DM}  ────────────────────────────────────────────────────────────────────────────${X}`);
  mv(3, HK); w(`${GD}↑↓${X}`);    mv(3, HD); w(`${DM}选择字段${X}`);
  mv(3, HK2); w(`${GD}←→${X}`);   mv(3, HD2); w(`${DM}切换选项${X}`);
  mv(3, HK3); w(`${GD}Enter${X}`); mv(3, HD3); w(`${DM}应用/恢复宠物${X}`);
  mv(4, HK); w(`${GD}r${X}`);     mv(4, HD); w(`${DM}属性定制刷新${X}`);
  mv(4, HK2); w(`${GD}n${X}`);    mv(4, HD2); w(`${DM}改名${X}`);
  mv(4, HK3); w(`${GD}d${X}`);    mv(4, HD3); w(`${DM}删除条目${X}`);
  mv(5, HK); w(`${GD}q${X}`);     mv(5, HD); w(`${DM}退出${X}`);
  mv(6, 1); w(`${DM}  ────────────────────────────────────────────────────────────────────────────${X}`);

  // Left panel — attribute selectors
  const fields = [
    { label: "SPECIES", val: sp.toUpperCase() },
    { label: "EYE", val: eye },
    { label: "HAT", val: hat },
    { label: "SHINY", val: SHINY_OPTS[selShiny] },
  ];
  for (let i = 0; i < fields.length; i++) {
    const row = 8 + i;
    const f = fields[i];
    const active = selField === i;
    mv(row, 1);
    if (active) {
      w(`  ${GD}▸ ${BD}${f.label.padEnd(9)}${X} ${GD}◀ ${BD}${f.val.padEnd(10)}${X}${GD} ▶${X}`);
    } else {
      w(`  ${DM}  ${f.label.padEnd(9)}   ${f.val.padEnd(10)}${X}\x1b[K`);
    }
  }

  // Start button
  const btnRow = 13;
  mv(btnRow, 1);
  if (mode === "design") {
    const active = selField === 4;
    if (active) w(`  ${IV}${GD}  ▶ APPLY  ${X}`);
    else w(`  ${DM}    APPLY  ${X}`);
  } else if (mode === "searching") {
    const spinner = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
    w(`  ${GD}${spinner[tick % spinner.length]} Searching... (q/Enter cancel)${X}`);
  } else if (mode === "found") {
    w(`  ${GD}✅ Applied!${X}`);
    mv(btnRow + 1, 1); w(`  ${DM}Enter=design  ↑/↓=browse saved  q=quit${X}`);
  }

  // Saved collection (navigable)
  const savedStart = btnRow + 2;
  if (savedEntries.length > 0) {
    mv(savedStart, 1); w(`${DM}── Saved (${savedEntries.length}) ──${X}`);
    for (let i = 0; i < savedEntries.length; i++) {
      const e = savedEntries[i];
      const total = e.stats ? Object.values(e.stats).reduce((a,b)=>a+b,0) : 0;
      const isCurrent = e.userID === currentUid;
      const fieldIdx = 5 + i;
      const isSelected = selField === fieldIdx;
      const mark = isCurrent ? `${GN}★${X}` : " ";
      const ptr = isSelected ? `${GD}▸${X}` : " ";
      mv(savedStart + 1 + i, 1);
      if (isSelected) {
        w(`${ptr} ${mark} ${IV}${GD} ${(e.species||"?").toUpperCase().padEnd(12)} ${(e.eye||"").padEnd(3)} ${(e.hat||"").padEnd(12)} ${String(total).padStart(3)} ${X}\x1b[K`);
      } else {
        const ec = isCurrent ? GD : DM;
        w(`${ptr} ${mark} ${ec}${(e.species||"?").toUpperCase().padEnd(12)} ${(e.eye||"").padEnd(3)} ${(e.hat||"").padEnd(12)} ${String(total).padStart(3)}${X}\x1b[K`);
      }
    }
  }

  // Right panel — clear to end of line (avoids wrapping issues)
  for (let r = 8; r <= 35; r++) { mv(r, RIGHT_C); w("\x1b[K"); }

  // Right panel — all content indented to center
  const RC = RIGHT_C + 4; // base indent for right panel content

  // Species title
  const shinyLabel = selShiny ? ` ✨` : "";
  mv(8, RC); w(`${GD}${BD}${previewSp.toUpperCase()} // legendary ★★★★★${shinyLabel}${X}`);
  mv(9, RC); w(`${DM}${"─".repeat(28)}${X}`);

  // Sprite — fixed 5 rows, extra indent to center the ASCII art
  const SPRITE_INDENT = RC + 4;
  for (let i = 0; i < 5; i++) {
    mv(10 + i, SPRITE_INDENT);
    if (i < sprite.length) {
      w(`${GD}${sprite[i]}${X}`);
    }
  }

  // Fixed positions below sprite
  const INFO_ROW = 16;
  mv(INFO_ROW, RC); w(`${DM}${"─".repeat(28)}${X}`);
  mv(INFO_ROW + 1, RC); w(`${DM}eye${X}  ${BD}${previewEye}${X}    ${DM}hat${X}  ${BD}${previewHat}${X}    ${DM}shiny${X}  ${BD}${SHINY_OPTS[selShiny]}${X}`);

  // Stats (if found or viewing saved)
  const displayBuddy = foundBuddy || (selField >= 5 && savedEntries[selField - 5]);
  if (displayBuddy) {
    const s = displayBuddy.stats || {};
    const total = Object.values(s).reduce((a,b)=>a+b,0);
    const prevTotal = prevStats ? Object.values(prevStats).reduce((a,b)=>a+b,0) : null;
    const totalDiff = prevTotal !== null ? total - prevTotal : 0;
    const totalDiffStr = totalDiff > 0 ? ` \x1b[32m+${totalDiff}${X}` : totalDiff < 0 ? ` \x1b[31m${totalDiff}${X}` : "";
    mv(INFO_ROW + 3, RC);
    if (mode === "rename") {
      w(`${GD}${BD}Name: ${renameBuffer}█${X}  ${DM}(Enter 确认 · Esc 取消)${X}`);
    } else {
      w(`${GD}${BD}${displayBuddy.name || "?"}${X}  ${DM}(${total} total)${X}${totalDiffStr}`);
    }
    for (let i = 0; i < STAT_NAMES.length; i++) {
      const n = STAT_NAMES[i];
      const v = s[n] || 0;
      const bar = "█".repeat(Math.round(v/10)) + `${DM}${"░".repeat(10 - Math.round(v/10))}${X}`;
      let diff = "";
      if (prevStats && prevStats[n] !== undefined) {
        const d = v - prevStats[n];
        if (d > 0) diff = ` \x1b[32m↑${d}${X}`;
        else if (d < 0) diff = ` \x1b[31m↓${Math.abs(d)}${X}`;
      }
      if (mode === "reroll_setup") {
        // Show direction arrows and cursor
        const cursor = rerollCursor === i ? `${GD}▸${X}` : " ";
        const dir = rerollDirs[i] === 1 ? `${GN}↑${X}` : `\x1b[31m↓${X}`;
        mv(INFO_ROW + 4 + i, RC); w(`${cursor}${dir} ${BD}${n.padEnd(10)}${X} ${bar} ${v}${diff}`);
      } else {
        mv(INFO_ROW + 4 + i, RC); w(` ${DM}${n.padEnd(10)}${X} ${bar} ${v}${diff}`);
      }
    }
    // Show mode-specific hints
    if (mode === "reroll_setup") {
      mv(INFO_ROW + 10, RC); w(`${DM}↑↓选择  Enter切换升降  ${X}${GD}r 开始刷新${X}${DM}  Esc取消${X}`);
    }
  }
}

// ── Apply: find matching userID (async, interruptible) ──
// ── Reroll stats: use rerollDirs for per-stat constraints ──
async function rerollStats(entryIdx) {
  const entry = savedEntries[entryIdx];
  const ts = entry.species, te = entry.eye, th = entry.hat;
  const oldStats = entry.stats || {};
  mode = "searching";
  const BATCH = 50000;

  while (mode === "searching") {
    for (let i = 0; i < BATCH; i++) {
      const uid = genUserId();
      const hash = bunHash(uid + SALT);
      const rng = mulberry32(hash);
      const rarity = rollRarity(rng);
      if (rarity !== "legendary") continue;
      const species = pick(rng, SPECIES);
      if (species !== ts) continue;
      const eye = pick(rng, EYES);
      if (eye !== te) continue;
      const hat = pick(rng, HATS);
      if (hat !== th) continue;
      const shiny = rng() < 0.01;
      // Preserve shiny status: if original was shiny, only accept shiny results
      if (entry.shiny && !shiny) continue;
      const stats = rollStats(rng, rarity);

      // Check all stat constraints from rerollDirs
      let ok = true;
      let anyImproved = false;
      for (let si = 0; si < STAT_NAMES.length; si++) {
        const n = STAT_NAMES[si];
        const oldVal = oldStats[n] || 0;
        if (rerollDirs[si] === 1) {
          if (stats[n] < oldVal) { ok = false; break; } // must not decrease
          if (stats[n] > oldVal) anyImproved = true;
        } else {
          if (stats[n] > oldVal) { ok = false; break; } // must not increase
          if (stats[n] < oldVal) anyImproved = true;
        }
      }
      if (!ok || !anyImproved) continue;

      // Found higher stats — save old for diff display
      prevStats = entry.stats ? {...entry.stats} : null;
      const ni = (species.charCodeAt(0) + eye.charCodeAt(0)) % FALLBACK_NAMES.length;
      const b = { rarity, species, eye, hat, shiny, stats, name: FALLBACK_NAMES[ni] };
      foundBuddy = b; foundUid = uid; mode = "found";

      // Update entry in place
      savedEntries[entryIdx] = { ...entry, userID: uid, stats, shiny, name: b.name,
        companion: { name: b.name, personality: `A legendary ${species} of few words.`, hatchedAt: Date.now() },
        time: new Date().toISOString().replace("T"," ").slice(0,19) };
      writeFileSync(legendaryLog, JSON.stringify(savedEntries, null, 2));

      // Apply to config
      const data = JSON.parse(readFileSync(homeJson, "utf8"));
      data.userID = uid;
      data.companion = savedEntries[entryIdx].companion;
      writeConfig(data);
      currentUid = uid;
      draw();
      return;
    }
    const cancel = pollKey();
    if (cancel === "quit" || cancel === "enter" || cancel === "r") { mode = "design"; draw(); return; }
    tick++;
    draw();
    await sleep(100);
  }
}

async function applyDesign() {
  const ts = SPECIES[selSpecies], te = EYES[selEye], th = HATS[selHat];
  const wantShiny = selShiny === 1;
  mode = "searching";
  const BATCH = 50000;

  while (mode === "searching") {
    for (let i = 0; i < BATCH; i++) {
      const uid = genUserId();
      const hash = bunHash(uid + SALT);
      const rng = mulberry32(hash);
      const rarity = rollRarity(rng);
      if (rarity !== "legendary") continue;
      const species = pick(rng, SPECIES);
      if (species !== ts) continue;
      const eye = pick(rng, EYES);
      if (eye !== te) continue;
      const hat = pick(rng, HATS);
      if (hat !== th) continue;
      const shiny = rng() < 0.01;
      if (wantShiny && !shiny) continue;

      const stats = rollStats(rng, rarity);
      const ni = (species.charCodeAt(0) + eye.charCodeAt(0)) % FALLBACK_NAMES.length;
      applyAndSave(uid, { rarity, species, eye, hat, shiny, stats, name: FALLBACK_NAMES[ni] });
      return;
    }
    const cancel = pollKey();
    if (cancel === "quit" || cancel === "enter") { mode = "design"; draw(); return; }
    tick++;
    draw();
    await sleep(100);
  }
}

function applyAndSave(uid, b) {
  prevStats = null; // no diff for fresh apply
  foundBuddy = b; foundUid = uid; mode = "found";
  const data = JSON.parse(readFileSync(homeJson, "utf8"));
  const oldUid = data.oauthAccount?.accountUuid || data.userID || "none";
  data.userID = uid;
  data.companion = { name: b.name, personality: `A legendary ${b.species} of few words.`, hatchedAt: Date.now() };
  writeConfig(data);
  // Verify write
  const verify = JSON.parse(readFileSync(homeJson, "utf8"));
  const vUid = verify.oauthAccount?.accountUuid || verify.userID || "?";
  const vHash = bunHash(vUid + SALT);
  const vRng = mulberry32(vHash);
  const vRar = rollRarity(vRng);
  const vSp = pick(vRng, SPECIES);
  currentUid = uid;
  const entry = { time: new Date().toISOString().replace("T"," ").slice(0,19), species: b.species, name: b.name, userID: uid, eye: b.eye, hat: b.hat, shiny: b.shiny, stats: b.stats, companion: data.companion };
  let entries = []; try { entries = JSON.parse(readFileSync(legendaryLog, "utf8")); } catch {}
  const k = `${b.species}|${b.eye}|${b.hat}`;
  const nt = Object.values(b.stats).reduce((a,c)=>a+c,0);
  let replaced = false;
  for (let j = 0; j < entries.length; j++) {
    if (`${entries[j].species}|${entries[j].eye||""}|${entries[j].hat||""}` === k) {
      const ot = entries[j].stats ? Object.values(entries[j].stats).reduce((a,c)=>a+c,0) : 0;
      if (nt > ot) entries[j] = entry;
      replaced = true; break;
    }
  }
  if (!replaced) entries.push(entry);
  writeFileSync(legendaryLog, JSON.stringify(entries, null, 2));
  savedEntries = entries;
  const si = entries.findIndex(e => e.userID === uid);
  if (si >= 0) selField = 5 + si;
  draw();
}

// ── Main ──
process.stdin.setRawMode(true);
process.on("exit", () => { show_cursor(); process.stdin.setRawMode(false); });
process.on("SIGINT", () => { show_cursor(); process.exit(0); });

// First draw clears screen
clr();
draw();

// Animation timer
let animTimer = setInterval(() => {
  if (mode === "design" || mode === "found" || mode === "searching") { tick++; draw(); }
}, 500);

// Main input loop
while (true) {
  const key = pollKey();
  if (!key) { await sleep(50); continue; }

  if (key === "quit") {
    if (mode === "rename") { mode = "design"; draw(); continue; }
    clearInterval(animTimer);
    show_cursor();
    clr();
    process.exit(0);
  }

  // Rename mode input handling
  if (mode === "rename") {
    if (key === "rename_confirm") {
      const idx = selField - 5;
      if (idx >= 0 && idx < savedEntries.length && renameBuffer.trim()) {
        const newName = renameBuffer.trim();
        savedEntries[idx].name = newName;
        if (savedEntries[idx].companion) savedEntries[idx].companion.name = newName;
        writeFileSync(legendaryLog, JSON.stringify(savedEntries, null, 2));
        // Update config if this is the active buddy
        if (savedEntries[idx].userID === currentUid) {
          const data = JSON.parse(readFileSync(homeJson, "utf8"));
          if (data.companion) { data.companion.name = newName; writeConfig(data); }
        }
        if (foundBuddy) foundBuddy.name = newName;
      }
      mode = "design";
    } else if (key === "rename_cancel") {
      mode = "design";
    } else if (key === "rename_backspace") {
      renameBuffer = renameBuffer.slice(0, -1);
    } else if (key.startsWith("rename_char:")) {
      const ch = key.slice(12);
      if (renameBuffer.length + ch.length <= 20) renameBuffer += ch;
    }
    draw(); continue;
  }

  if (mode === "design") {
    const maxField = 4 + savedEntries.length; // 0-3=attrs, 4=start, 5+=saved
    if (key === "up") selField = Math.max(0, selField - 1);
    else if (key === "down") selField = Math.min(maxField, selField + 1);
    else if (key === "left") {
      if (selField === 0) selSpecies = (selSpecies - 1 + SPECIES.length) % SPECIES.length;
      else if (selField === 1) selEye = (selEye - 1 + EYES.length) % EYES.length;
      else if (selField === 2) selHat = (selHat - 1 + HATS.length) % HATS.length;
      else if (selField === 3) selShiny = (selShiny + 1) % 2;
    } else if (key === "right") {
      if (selField === 0) selSpecies = (selSpecies + 1) % SPECIES.length;
      else if (selField === 1) selEye = (selEye + 1) % EYES.length;
      else if (selField === 2) selHat = (selHat + 1) % HATS.length;
      else if (selField === 3) selShiny = (selShiny + 1) % 2;
    } else if (key === "enter") {
      if (selField === 4) {
        await applyDesign();
        continue;
      } else if (selField >= 5) {
        // Apply saved entry
        const idx = selField - 5;
        if (idx < savedEntries.length) {
          const e = savedEntries[idx];
          const data = JSON.parse(readFileSync(homeJson, "utf8"));
          data.userID = e.userID;
          data.companion = e.companion || { name: e.name, personality: `A legendary ${e.species} of few words.`, hatchedAt: Date.now() };
          writeConfig(data);
          currentUid = e.userID;
          // Update preview to match
          const si = SPECIES.indexOf(e.species); if (si >= 0) selSpecies = si;
          const ei = EYES.indexOf(e.eye); if (ei >= 0) selEye = ei;
          const hi = HATS.indexOf(e.hat); if (hi >= 0) selHat = hi;
        }
      }
    } else if (key === "delete") {
      if (selField >= 5) {
        const idx = selField - 5;
        if (idx < savedEntries.length) {
          savedEntries.splice(idx, 1);
          writeFileSync(legendaryLog, JSON.stringify(savedEntries, null, 2));
          if (selField > 4 + savedEntries.length) selField = Math.max(4, 4 + savedEntries.length);
          clr();
        }
      }
    } else if (key === "reroll") {
      if (selField >= 5) {
        const idx = selField - 5;
        if (idx < savedEntries.length) {
          rerollDirs = [...REROLL_DIR_DEFAULTS];
          rerollCursor = 0;
          mode = "reroll_setup";
        }
      }
    } else if (key === "rename") {
      if (selField >= 5 && selField - 5 < savedEntries.length) {
        renameBuffer = savedEntries[selField - 5].name || "";
        mode = "rename";
      }
    }
  } else if (mode === "found") {
    const maxField = 4 + savedEntries.length;
    if (key === "up") { selField = Math.max(0, selField - 1); mode = "design"; foundBuddy = null; }
    else if (key === "down") { selField = Math.min(maxField, selField + 1); mode = "design"; foundBuddy = null; }
    else if (key === "enter") { mode = "design"; foundBuddy = null; }
    else if (key === "reroll") {
      if (selField >= 5 && selField - 5 < savedEntries.length) {
        foundBuddy = null;
        rerollDirs = [...REROLL_DIR_DEFAULTS];
        rerollCursor = 0;
        mode = "reroll_setup";
      }
    } else if (key === "rename") {
      if (selField >= 5 && selField - 5 < savedEntries.length) {
        renameBuffer = savedEntries[selField - 5].name || "";
        mode = "rename";
      }
    }
  } else if (mode === "reroll_setup") {
    if (key === "up") rerollCursor = (rerollCursor - 1 + 5) % 5;
    else if (key === "down") rerollCursor = (rerollCursor + 1) % 5;
    else if (key === "enter") {
      // Toggle direction for selected stat
      rerollDirs[rerollCursor] *= -1;
    } else if (key === "reroll") {
      // Start rerolling with current dirs
      if (selField >= 5 && selField - 5 < savedEntries.length) {
        await rerollStats(selField - 5);
        continue;
      }
    } else if (key === "quit") {
      mode = "design";
    }
  }

  draw();
}
