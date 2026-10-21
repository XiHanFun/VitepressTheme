---
name: xihan-theme-changelog-collect
description: 收集 VitepressTheme 两个版本或引用之间的站点作者与读者可感知变化、补写 CHANGELOG.md 时使用。它不改版本号、不打标签，也不发布 npm 包。
---

# VitepressTheme 更新日志整理

## 事实源

- 用户指定的起止 tag/commit；未指定终点时使用当前 HEAD，未指定起点时先提出最近的 `v*` 标签供确认。
- `git log <from>..<to>` 与实际 diff；提交信息只作线索，以 diff 为准。
- `CHANGELOG.md` 现有的分类、语气与标题格式。

## 收录规则

- 只收站点作者与读者可感知的变更：配色与版式、正文组件、主题选项与 `defineXiHanConfig` 的字段、机读资产、界面文案。仓库自身的配置、CI、预览站、README 与技能不列。
- 每条以 **新增 / 修复 / 优化 / 调整 / 移除** 开头，说清读者看到什么、站点作者要不要改配置，不描述内部实现步骤。
- 选项名、组件名、CSS 类名与配置字段用反引号。
- 改名或删除主题选项、导出、CSS 类名或配置合并规则时写明站点怎么迁移。
- 不写使用主题的站点个数与依赖的具体版本号。

## 写法

新的一节放在最上面，标题是 `## v<版本>（YYYY-MM-DD）`（全角括号，与现有各节一致），日期写计划发布的那天。只整理条目时不改 `package.json` 的版本号；发版流程见 `version-release` 技能。
