---
name: xihan-theme-commit-msg
description: 根据 VitepressTheme 当前暂存区生成一行提交信息时使用。适用于“提交信息”“commit msg”“msg”或提交前概括 staged changes；只生成消息，不负责暂存、解决冲突或执行提交。
---

# VitepressTheme 提交信息

## 工作流

1. 运行 `git status --short --branch`，存在未解决冲突时停止并指出冲突，不生成假定已完成的提交信息。
2. 只读取 `git diff --cached --stat`、`git diff --cached` 和最近 20 条提交；未暂存内容不纳入，除非用户明确要求。
3. 暂存区为空时直接说明，不能根据工作区或聊天内容猜消息。
4. 将全部暂存改动归纳为一个意图，输出一行 Conventional Commit。

格式：`<type>: <中文说明>`，与仓库历史一致，scope 可省。允许的 type 为 `feat`、`fix`、`refactor`、`perf`、`docs`、`style`、`test`、`build`、`ci`、`chore`、`revert`。

- 主题样式、正文组件、站点默认配置、机读资产的用户可感知改动用 `feat` / `fix`。
- 只改预览站、README、仓库技能用 `docs` 或 `chore`；只改工作流用 `ci`。
- 发版提交固定写 `build: v<版本>`。

改名或删除主题选项、`defineXiHanConfig` 字段、导出、CSS 类名与配置合并规则时在 type 后加 `!`。只要求消息时，最终只输出提交标题，不附解释、代码块或候选列表。
