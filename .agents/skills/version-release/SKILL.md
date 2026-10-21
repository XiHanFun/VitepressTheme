---
name: xihan-theme-version-release
description: 为 VitepressTheme 定版本、补更新日志、打版本标签或发布 npm 包时使用。版本号手工定（不用 changesets），main 上的 v* 标签触发 release.yml 发布；只有用户明确要求实际发布时才允许合并 main、推送标签。
---

# VitepressTheme 版本发布

## 前置条件

- 工作区干净、无进行中的 merge/rebase、在 `dev` 上；detached HEAD 不发版。
- 版本真源是 `package.json` 的 `version`。语义化版本：改名或删除主题选项、`defineXiHanConfig` 字段、导出、CSS 类名或配置合并规则升主版本；新增能力升次版本；只修缺陷、调样式升修订版本。
- 标签格式 `v<版本>`。`release.yml` 先核对两条：标签指向的提交在 `main` 的历史里、标签号等于 `package.json` 的版本，任一不满足拒发。

## 准备版本

1. 核对上一个 `v*` 标签到当前提交的改动，确定版本级别。
2. 改 `package.json` 的 `version`；在 `CHANGELOG.md` 最上面补这一版的一节（写法见 `changelog-collect` 技能，标题 `## v<版本>（YYYY-MM-DD）`）。
3. 在 `playground/` 跑 `pnpm install` 与 `pnpm build`；改了样式或组件的，按 `theme-development` 技能用临时 `link:` 验过受影响的文档站，并已改回。
4. `git diff --check` 后提交 `build: v<版本>`。

## 发布

只有用户明确要求发布才执行：

1. 推 `dev`，等 `ci.yml`（构建预览站）通过。
2. `main` 从 `dev` 快进（`git fetch . dev:main` 或推 `<版本提交>:refs/heads/main`；不是快进就停下查），推 `main`。
3. 在版本提交上打 `v<版本>` 标签并推送，触发 `release.yml`：校验标签、构建预览站、`npm publish`（`publishConfig.provenance` 打开，使用仓库 Secrets 的 `NPM_TOKEN`）。
4. 只看工作流摘要；发完用 `npm view @xihanfun/vitepress-theme version --registry https://registry.npmjs.org` 核对（本机默认源可能是镜像，会滞后）。

## 发布之后

- 各文档站升级 `@xihanfun/vitepress-theme` 依赖，各站单独提交；VitePress 版本有变化时，各站与预览站的 `vitepress` 精确版本一起改。
- 不手改构建产物、不重复发布已存在的版本；工作流失败时停下报告，不移动或删除标签来掩盖问题。
