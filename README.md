# Claude Buddy Designer

Interactive TUI tool for designing your [Claude Code](https://claude.ai/code) companion buddy.

Pick your species, eyes, hat, and shiny — then apply instantly. No more random rolls.

![demo](https://github.com/user-attachments/assets/placeholder)

## Features

- **18 species** — duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk
- **Full attribute control** — species, eye style, hat, shiny toggle
- **Live preview** — animated ASCII sprite with idle sequence matching Claude Code
- **Collection manager** — auto-saves legendaries, browse and restore anytime
- **Stat reroller** — reroll stats while keeping appearance locked (only goes up, never down)
- **Shiny preservation** — rerolling a shiny buddy guarantees shiny results
- **Auto-detection** — detects native (bun) vs npm (node) Claude Code installs and uses the correct hash function

## Requirements

- [Bun](https://bun.sh/) runtime
- [Claude Code](https://claude.ai/code) installed

## Usage

```bash
bun buddy-designer.mjs
```

### Controls

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate fields |
| `←` `→` | Cycle options |
| `Enter` / `Space` | Apply design or restore saved buddy |
| `r` | Reroll stats (saved entries only, stats only go up) |
| `d` | Delete saved entry |
| `q` | Quit |

## How It Works

Claude Code generates buddy attributes deterministically from `hash(userID + SALT)` using a seeded PRNG ([Mulberry32](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c)). This tool finds a userID that produces your desired combination by brute-force searching the hash space.

- **Native CC** (installed via `claude` installer) uses `Bun.hash` (wyhash)
- **npm CC** (installed via `npm i -g @anthropic-ai/claude-code`) uses FNV-1a

The tool auto-detects which hash function your Claude Code uses and searches accordingly.

### What it changes

Only the `userID` field in your Claude Code config file (`~/.claude.json` or equivalent). Your authentication, settings, and everything else remain untouched. The companion's "soul" (name, personality) is written to the `companion` field.

## Saved Collection

Legendaries are saved to `~/.claude/buddy-legendaries.json`. Each entry records:

- Species, eye, hat, shiny status
- Full stat block (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK)
- UserID (for restoring later)
- Timestamp

The `★` marker shows which buddy is currently active.

## FAQ

**Q: Will this break my Claude Code?**
A: No. It only modifies `userID` in the config file. Claude Code re-derives the buddy on each startup. Your auth tokens and settings are not affected.

**Q: Can I go back to my old buddy?**
A: Yes. Your old userID is preserved in the saved collection if you applied a new buddy over it. You can also manually restore any saved entry.

**Q: Why does searching for shiny take so long?**
A: Shiny has a 1% chance per roll, on top of legendary's ~1% chance and the specific species/eye/hat combo. That's roughly 1 in 10 million. Be patient — it will find one.

**Q: Does this work on Linux?**
A: Yes, as long as you have Bun installed. Note that on some cloud VMs, Claude Code may need a restart to pick up the config change (file watchers can be unreliable on network filesystems).

## License

[MIT](LICENSE)
