# Claude Buddy Designer

[English](README.md) | [中文](README.zh-CN.md)

交互式终端工具，自定义你的 [Claude Code](https://claude.ai/code) 宠物伙伴。选择种族、眼睛、帽子和闪光效果，一键应用，告别随机。

> **注意：** 仅支持 API key 用户，不支持 OAuth 登录用户。
>
> **要求：** Claude Code **v2.1.89** 及以上版本。使用本工具前，请先在 Claude Code 中执行一次 `/buddy`。

![designer](assets/designer.png)

应用后，重启 Claude Code 并执行 `/buddy` 查看效果：

![buddy-result](assets/buddy-result.png)

## 功能

- **18 种族** — 鸭子、鹅、果冻、猫、龙、章鱼、猫头鹰、企鹅、乌龟、蜗牛、幽灵、六角恐龙、水豚、仙人掌、机器人、兔子、蘑菇、胖墩
- **完全属性控制** — 种族、眼睛样式、帽子、闪光开关
- **实时预览** — 动画 ASCII 精灵图，与 Claude Code 待机动画一致
- **收藏管理** — 自动保存传说级宠物，随时浏览和恢复
- **定向属性刷新** — 进入属性定制模式，为每项属性设置方向（↑提高 / ↓降低），然后刷新。默认：DEBUGGING↑ PATIENCE↑ CHAOS↓ WISDOM↑ SNARK↓
- **自定义改名** — 给宠物起自定义名字，支持中文
- **闪光保护** — 刷新闪光宠物时保证闪光不丢失
- **自动检测** — 自动识别原生安装（bun）和 npm 安装（node）的 Claude Code，使用对应的哈希函数

## 安装

### 1. 安装 Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# 或通过 Homebrew
brew install oven-sh/bun/bun
```

### 2. 运行

```bash
bun buddy-designer.mjs
```

## 操作说明

### 设计模式

| 按键 | 操作 |
|------|------|
| `↑` `↓` | 选择字段 / 浏览已保存条目 |
| `←` `→` | 切换种族、眼睛、帽子、闪光 |
| `Enter` | 应用设计 或 恢复已保存的宠物 |
| `r` | 进入属性定制刷新（仅已保存条目） |
| `n` | 给宠物改名（仅已保存条目） |
| `d` | 删除已保存条目 |
| `q` | 退出 |

### 属性定制模式（按 `r` 后进入）

| 按键 | 操作 |
|------|------|
| `↑` `↓` | 选择要配置的属性 |
| `Enter` | 切换方向（↑提高 / ↓降低） |
| `r` | 按当前设置开始刷新 |
| `Esc` / `q` | 取消返回设计模式 |

默认方向：DEBUGGING↑ PATIENCE↑ CHAOS↓ WISDOM↑ SNARK↓。所有约束需同时满足。已达极限的属性（100 或 1）允许保持不变。

### 改名模式（按 `n` 后进入）

| 按键 | 操作 |
|------|------|
| 输入 | 输入新名字（最长 20 字符，支持中文） |
| `Enter` | 确认 |
| `Esc` | 取消 |

## 工作原理

Claude Code 通过 `hash(userID + SALT)` 配合种子伪随机数生成器（[Mulberry32](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c)）确定性地生成宠物属性。本工具通过暴力搜索哈希空间，找到能生成你想要的组合的 userID。

- **原生安装**（通过 `claude` 安装器）使用 `Bun.hash`（wyhash）
- **npm 安装**（通过 `npm i -g @anthropic-ai/claude-code`）使用 FNV-1a

本工具会自动检测你的 Claude Code 使用哪种哈希函数，并据此搜索。

### 修改了什么

仅修改 Claude Code 配置文件（`~/.claude.json` 或等效路径）中的两个字段：

- `userID` — 决定宠物的外观和属性
- `companion` — 存储宠物的名字和性格

你的认证信息、设置等不受影响。

## 收藏集

传说级宠物保存在 `~/.claude/buddy-legendaries.json`，每条记录包含：

- 种族、眼睛、帽子、闪光状态
- 完整属性值（DEBUGGING、PATIENCE、CHAOS、WISDOM、SNARK）
- 自定义名字
- UserID（用于恢复）
- 时间戳

`★` 标记表示当前激活的宠物。

## 常见问题

**Q: 会破坏我的 Claude Code 吗？**
A: 不会。仅修改配置文件中的 `userID` 和 `companion`，Claude Code 每次启动时重新计算宠物外观。认证令牌和设置不受影响。

**Q: 能恢复之前的宠物吗？**
A: 可以。所有应用过的宠物都保存在收藏集中，选中后按 Enter 即可恢复。

**Q: OAuth 登录用户能用吗？**
A: 不支持。OAuth 登录用户的宠物由 `oauthAccount.accountUuid` 决定，本工具不会修改该字段。仅支持 API key 用户。

**Q: 为什么搜索闪光这么慢？**
A: 闪光概率 1%，叠加传说级约 1% 和特定外观组合，大约千万分之一。耐心等待即可。

**Q: 为什么属性刷新一直找不到？**
A: 5项属性约束需要同时满足。如果某项属性已经达到极限（如 100），工具允许其保持不变。但所有属性同时很高非常稀有，可以尝试把部分属性切换为 ↓ 来放宽约束。

**Q: 支持 Linux 吗？**
A: 支持，安装 Bun 即可。部分云服务器可能需要重启 Claude Code 才能生效。

## 许可证

[MIT](LICENSE)
