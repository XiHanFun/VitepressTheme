# VitepressTheme

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

曦寒文档站统一主题 `@xihanfun/vitepress-theme`。组织门户、开发框架、视图组件、基础应用四个 VitePress 文档站共用这一份配色、版式与站点默认配置，保持同一套观感。

## 包含什么

| 部分 | 内容 |
| --- | --- |
| 配色 | 蓝色品牌色与明暗两套取值，首页标题渐变，提示块、按钮、链接、搜索高亮跟随品牌色 |
| 版式 | 宽屏不居中留白，导航栏、侧边栏与正文贴视口铺开；338px 侧边栏与页面同底，悬停时才出现滚动条 |
| 细节 | 细滚动条、暗色模式链接提亮、本地搜索结果卡片、导航徽章 `.xh-nav-badge` |
| 组件 | 正文上方的「取本页 Markdown」直链 |
| 配置 | 中文界面文案、本地搜索中文文案、目录与翻页、页脚、作者与图标元信息、按仓库名生成的社交链接与编辑链接 |

## 安装

```bash
pnpm add @xihanfun/vitepress-theme vitepress@2.0.0-alpha.20 vue
```

需要 `vitepress@^2.0.0-alpha.20` 与 `vue@^3.5.0`。VitePress 2 仍在预发布阶段，站点里写精确版本，升级时四个站一起改。

## 使用

`.vitepress/config.ts`：

```ts
import { defineXiHanConfig } from "@xihanfun/vitepress-theme/config";

export default defineXiHanConfig({
  title: "曦寒开发框架文档",
  description: "基于 DotNet 的模块化开发框架",
  keywords: "曦寒,开发框架,DotNet",
  repo: "XiHan.Framework",
  themeConfig: {
    nav,
    sidebar,
  },
});
```

`defineXiHanConfig` 接受全部 VitePress 站点配置，另有三项：

| 选项 | 说明 |
| --- | --- |
| `repo` | XiHanFun 组织下的仓库名，生成 GitHub / Gitee / GitCode 社交链接与「在 GitHub 上编辑此页」地址（指向仓库 `docs/` 目录）；省略时社交链接指向组织主页 |
| `keywords` | 页面 keywords 元信息 |
| `pageMarkdown` | `(relativePath) => Promise<string \| null>`，开发服务器上按需生成 `/__markdown/<页面路径>`，与主题选项 `pageMarkdown` 配套 |

站点里写的 `themeConfig` 字段覆盖同名默认值，`head` 追加在默认项之后，`vite.plugins` 追加在内置插件之后，`vite.resolve.dedupe`、`vite.ssr.noExternal`、`vite.optimizeDeps.exclude` 与主题需要的取值合并。

`.vitepress/theme/index.ts`：

```ts
import { defineXiHanTheme } from "@xihanfun/vitepress-theme";

export default defineXiHanTheme({ pageMarkdown: true });
```

不需要任何选项时直接 `export { default } from "@xihanfun/vitepress-theme";`。

| 选项 | 说明 |
| --- | --- |
| `pageMarkdown` | 正文上方显示「取本页 Markdown」直链，指向构建产物里同路径的 `.md` |
| `slots` | 填入默认布局的插槽，如 `{ "layout-bottom": () => h(MyComponent) }` |
| `enhanceApp` | 在默认主题的 `enhanceApp` 之后执行，用来注册站点自己的全局组件 |

站点自己的样式在 `theme/index.ts` 里导入本包之后再导入，同等特异性下排在后面的覆盖主题。

## 本地开发

`playground/` 是主题的预览站，以 `link:..` 引用本仓库源码，覆盖首页、正文排版、表格、代码、提示块与徽章。

```bash
cd playground
pnpm install
pnpm dev
```

`pnpm build` 构建预览站，CI 以它验证主题可用。改完主题想在某个文档站里看效果，临时把该站的依赖改成指向本仓库的 `link:`，验证完改回，不要提交。

## 目录结构

```text
VitepressTheme/
├── src/
│   ├── index.ts                 # 主题入口：defineXiHanTheme
│   ├── config.js / config.d.ts  # 站点配置：defineXiHanConfig（Node 直接加载，写成 JS）
│   ├── components/              # XhPageMarkdown
│   └── styles/                  # vars 配色 / layout 版式 / base 细节
├── playground/                  # 预览站
├── .github/workflows/           # ci.yml 构建预览站，release.yml 发布到 npm
└── package.json                 # @xihanfun/vitepress-theme
```

## 发布

1. 改 `package.json` 的 `version`，提交到 `dev`。
2. 合入 `main` 后打 `v<版本号>` 标签并推送。
3. `release.yml` 校验标签打在 `main` 上且与版本号一致、预览站能构建，再发布到 npm。

需要在仓库 Secrets 里配置 `NPM_TOKEN`，npm 上需要有 `xihanfun` 组织。

## 版权&授权

Copyright (c) 2021-Present XiHanFun and contributors.

本项目采用 MIT 授权，详见 [License](./LICENSE)。
