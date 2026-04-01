# Claude Buddy Designer

Interactive TUI tool for designing your [Claude Code](https://claude.ai/code) companion buddy.

Pick your species, eyes, hat, and shiny — then apply instantly. No more random rolls.

交互式终端工具，自定义你的 [Claude Code](https://claude.ai/code) 宠物伙伴。选择种族、眼睛、帽子和闪光效果，一键应用，告别随机。

![demo](assets/demo.png)

## Features / 功能

- **18 species / 18 种族** — duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk
- **Full attribute control / 完全属性控制** — species, eye style, hat, shiny toggle / 种族、眼睛、帽子、闪光开关
- **Live preview / 实时预览** — animated ASCII sprite with idle sequence matching Claude Code / 动画精灵图，与 Claude Code 待机动画一致
- **Collection manager / 收藏管理** — auto-saves legendaries, browse and restore anytime / 自动保存传说级，随时浏览恢复
- **Stat reroller / 属性刷新** — reroll stats while keeping appearance locked (only goes up, never down) / 锁定外观刷属性，只升不降
- **Shiny preservation / 闪光保护** — rerolling a shiny buddy guarantees shiny results / 刷新闪光宠物时保证闪光不丢失
- **Auto-detection / 自动检测** — detects native (bun) vs npm (node) Claude Code installs and uses the correct hash function / 自动识别 CC 安装方式并使用对应哈希函数

## Install / 安装

### 1. Install Bun / 安装 Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# or via Homebrew
brew install oven-sh/bun/bun
```

### 2. Run / 运行

```bash
bun buddy-designer.mjs
```

### Controls / 操作

| Key / 按键 | Action / 操作 |
|-----|--------|
| `↑` `↓` | Navigate fields / 选择字段 |
| `←` `→` | Cycle options / 切换选项 |
| `Enter` / `Space` | Apply design or restore saved buddy / 应用设计或恢复已保存的宠物 |
| `r` | Reroll stats (only goes up) / 刷新属性（只升不降） |
| `d` | Delete saved entry / 删除已保存条目 |
| `q` | Quit / 退出 |

## How It Works / 工作原理

Claude Code generates buddy attributes deterministically from `hash(userID + SALT)` using a seeded PRNG ([Mulberry32](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c)). This tool finds a userID that produces your desired combination by brute-force searching the hash space.

Claude Code 通过 `hash(userID + SALT)` 配合种子伪随机数生成器（Mulberry32）确定性地生成宠物属性。本工具通过暴力搜索哈希空间，找到能生成你想要的组合的 userID。

- **Native CC** (installed via `claude` installer) uses `Bun.hash` (wyhash)
- **npm CC** (installed via `npm i -g @anthropic-ai/claude-code`) uses FNV-1a

The tool auto-detects which hash function your Claude Code uses and searches accordingly.

本工具会自动检测你的 Claude Code 使用哪种哈希函数，并据此搜索。

### What it changes / 修改了什么

Only the `userID` field in your Claude Code config file (`~/.claude.json` or equivalent). Your authentication, settings, and everything else remain untouched. The companion's "soul" (name, personality) is written to the `companion` field.

仅修改配置文件中的 `userID` 字段，不影响认证、设置等任何其他内容。宠物的"灵魂"（名字、性格）写入 `companion` 字段。

## Saved Collection / 收藏集

Legendaries are saved to `~/.claude/buddy-legendaries.json`. Each entry records:

传说级宠物保存在 `~/.claude/buddy-legendaries.json`，每条记录包含：

- Species, eye, hat, shiny status / 种族、眼睛、帽子、闪光状态
- Full stat block (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK) / 完整属性值
- UserID (for restoring later) / UserID（用于恢复）
- Timestamp / 时间戳

The `★` marker shows which buddy is currently active. / `★` 标记表示当前激活的宠物。

## FAQ / 常见问题

**Q: Will this break my Claude Code? / 会破坏我的 Claude Code 吗？**
A: No. It only modifies `userID` in the config file. Claude Code re-derives the buddy on each startup. Your auth tokens and settings are not affected.
不会。仅修改配置文件中的 `userID`，Claude Code 每次启动时重新生成宠物。认证令牌和设置不受影响。

**Q: Can I go back to my old buddy? / 能恢复之前的宠物吗？**
A: Yes. Your old userID is preserved in the saved collection. You can restore any saved entry anytime.
可以。旧的 userID 保存在收藏集中，随时可以恢复。

**Q: Why does searching for shiny take so long? / 为什么搜索闪光这么慢？**
A: Shiny has a 1% chance per roll, on top of legendary's ~1% chance and the specific species/eye/hat combo. That's roughly 1 in 10 million. Be patient — it will find one.
闪光概率 1%，叠加传说级 ~1% 和特定外观组合，大约千万分之一。耐心等待即可。

**Q: Does this work with OAuth login? / OAuth 登录用户能用吗？**
A: This tool only modifies `userID`. If you're logged in via OAuth, Claude Code uses `oauthAccount.accountUuid` (which takes priority over `userID`) to generate your buddy. In that case, you need to remove the `oauthAccount` section from your config file first, or log in with an API key instead.
本工具仅修改 `userID`。如果你通过 OAuth 登录，Claude Code 优先使用 `oauthAccount.accountUuid` 生成宠物，此时需先删除配置文件中的 `oauthAccount` 字段，或改用 API key 登录。

**Q: Does this work on Linux? / 支持 Linux 吗？**
A: Yes, as long as you have Bun installed. Note that on some cloud VMs, Claude Code may need a restart to pick up the config change.
支持，安装 Bun 即可。部分云服务器可能需要重启 Claude Code 才能生效。

## License

[MIT](LICENSE)
