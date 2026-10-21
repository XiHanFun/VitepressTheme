---
name: xihan-theme-create-pr
description: 为 VitepressTheme 准备、审查或创建 Pull Request 时使用。适用于生成 PR 标题与正文、比较当前分支和基线、执行 gh pr create；普通代码审查不使用。
---

# VitepressTheme 创建 PR

## 前置检查

- 读取 `git status --short --branch`；存在 rebase、merge、未解决冲突或 detached HEAD 时，不创建 PR。
- 分支名按 `AGENTS.md`「分支与 worktree」分组；仍是 `claude/<名>`、`codex/<名>` 等工具前缀时，推送前先按任务改名，不把工具前缀推到远端。分支为 `issue/<编号>` 时在正文写明关联的 Issue。
- 根据用户意图、当前分支上游和远端分支确定 base；日常开发面向 `dev`，`main` 只接收发版，不得无依据改成 `main`。
- 使用 `git log <base>..HEAD`、`git diff --stat <base>...HEAD` 和完整 diff 总结整条分支，不只看最后一个提交。
- 核对改动里没有指向本地路径的临时 `link:`、没有构建产物。

## PR 内容

仓库没有 PR 模板，正文按下面几节写：

- **变更说明**：站点作者或读者会看到什么不同，不罗列文件。
- **影响的文档站**：哪些站会受影响（门户与各产品站），是否需要站点改配置。
- **验证**：预览站 `pnpm build` 的结果；用 `pnpm dev` 看过哪些页面（明暗两色、窄屏）；临时 `link:` 验过哪些站。只写实际做过的。
- **破坏性变更**：改名或删除了主题选项、`defineXiHanConfig` 字段、导出、CSS 类名或配置合并规则时，写明迁移方式；没有就写「无」。
- **是否需要发版**：需要时说明 `CHANGELOG.md` 是否已补这一版的条目。

标题使用 Conventional Commit 形态并准确概括用户影响。

只要求草稿时只输出标题和正文，不写远程。明确要求创建 PR 时，确认分支已推送后使用 `gh pr create`；可以推送当前分支，但禁止 force push、合并或修改其他远端状态。创建后返回 PR 链接。
