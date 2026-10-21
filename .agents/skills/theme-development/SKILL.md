---
name: xihan-theme-theme-development
description: 修改 VitepressTheme 的配色与版式样式、正文组件、站点默认配置（defineXiHanConfig）或机读资产时使用，含预览站验证与用临时 link: 验证各文档站。只改某个文档站自己的导航、侧栏或示例时不用，去那个站的仓库改。
---

# VitepressTheme 主题开发

先读仓库根的 `AGENTS.md`「职责与边界」「硬性约定」，确认这次要改的东西归主题。

## 改动落在哪

| 要改的 | 文件 | 要点 |
| --- | --- | --- |
| 配色 | `src/styles/vars.css` | 品牌色写成 `--xh-doc-*`，再接到 VitePress 的 `--vp-*`；明暗两套取值一起改 |
| 版式 | `src/styles/layout.css` | 全宽版式与侧边栏；追平默认主题带 scoped 属性的选择器用「类名写两遍」，不加 `!important` |
| 细节 | `src/styles/base.css` | 暗色链接、滚动条、本地搜索、导航徽章 `.xh-nav-badge` |
| 正文组件 | `src/components/*.vue` | 挂进默认布局插槽见 `src/index.ts` 的 `defineXiHanTheme`；要给站点用的组件在 `index.ts` 导出，需要时在 `enhanceApp` 全局注册 |
| 主题运行时选项 | `src/index.ts`、`src/options.ts` | `XiHanThemeOptions` 与解析后的 `XiHanResolvedOptions` 一起改 |
| 界面文案 | `src/labels.js`、`src/labels.d.ts`、`src/config.d.ts` | 文案集中在 `XIHAN_LABELS`，站点可在 `themeConfig` 里用同名字段覆盖；新增文案同时补 `XiHanThemeConfig` 的类型 |
| 站点默认配置 | `src/config.js`、`src/config.d.ts` | Node 直接加载，只写 JS（不写 TS 语法、不 import Vue 或 `.vue`）；类型写在 `config.d.ts`，两边一起改 |
| 机读资产 | `src/llms.js` | `llms.txt`、`llms-full.txt`、分册与每页 `.md`；开发服务器上的 `/__markdown/<页面路径>` 与构建产物保持一致 |
| 运营数据与本机存储 | `src/composables/promotions.ts` | 读写本机存储一律经这里的 `storage`，键名 `xh-docs-` 前缀 |

## 写组件时

- 模块顶层与 `setup` 同步阶段不碰 `window`、`document`、`localStorage`；浏览器能力在 `onMounted` 之后判断。页面渲染前就得定的状态（如公告是否占位）写成 `head` 里的内联脚本，见 `config.js` 的 `bannerHead`。
- 网络只读运营数据与 GitHub 仓库的 Star 数，失败时静默不显示，不阻塞页面。
- 文案取 `theme.value.<字段> ?? XIHAN_LABELS.<字段>`，不在组件里写死中文。
- 可交互的元素用原生按钮或链接，键盘与焦点要可用；全屏、弹出类组件退出后焦点回到触发它的元素。
- 注释只写代码做什么，设计理由写进提交说明。

## 改配置合并时

`defineXiHanConfig` 的合并规则（`themeConfig` 覆盖同名默认值、`buildEnd` 先于机读资产、`head` 与 `vite.plugins` 追加、`dedupe` 等合并）决定各站的行为。改它、或改名删除任何选项，都按破坏性变更处理：升主版本，在 `CHANGELOG.md` 写明站点怎么迁移。

## 验证

1. **预览站**：在 `playground/` 跑 `pnpm install`、`pnpm build`，再 `pnpm dev` 看改到的页面，明暗两色与窄屏都看。预览站覆盖不到这次的改动时，在 `playground/` 补页面或配置（预览站内容随改动一起提交）。
2. **受影响的文档站**：各站默认装 npm 上的正式包，同级的主题源码不会自动生效。验证没发版的改动时，在该站的 `docs/` 里：
   - 把 `package.json` 的 `@xihanfun/vitepress-theme` 临时改成 `link:../../VitepressTheme`（各仓库与本仓库同级，`docs/` 在仓库下一层）；
   - `pnpm install` 后跑该站的构建（站点各自的门禁见那个仓库的 `AGENTS.md`；UI 与四款设计器的文档站要先构建各自的库），用 `pnpm dev` 看页面；看到旧样式时清掉 `.vitepress/cache` 再起；
   - 验完只还原这次自己改的 `package.json` 与锁文件，再 `pnpm install` 装回正式包。临时 `link:` 不提交。
3. 改了站点默认配置或机读资产的，至少验门户与一个产品站；改了样式或组件的，验到实际用到它的站。

验证全过后按 `AGENTS.md`「Git 与提交」提交；要发版的，按 `version-release` 技能走。
