# 正文排版

这一页覆盖文档正文里最常见的元素，改完主题先在这里看一遍效果。正文里的[站内链接](./blocks.md)、[外部链接](https://vitepress.dev)与行内代码 `defineXiHanConfig` 都跟随品牌色。

## 段落与列表

曦寒文档站的正文以中文为主，段落之间留出足够的行高，长段落也能保持易读。**加粗**用来强调关键结论，*斜体*用得很少。

- 开发框架：.NET 模块化开发框架
- 视图组件：框架无关的 Headless UI 组件库
- 基础应用：多租户中后台应用
  - 后端手册
  - 前端手册

1. 安装主题包
2. 在配置里调用 `defineXiHanConfig`
3. 在主题入口调用 `defineXiHanTheme`

## 表格

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `repo` | `string` | 仓库名，生成社交链接与编辑链接 |
| `keywords` | `string` | 页面 keywords 元信息 |
| `pageMarkdown` | `(relativePath: string) => Promise<string \| null>` | 开发服务器按需生成页面 Markdown |

## 代码

```ts
import { defineXiHanConfig } from "@xihanfun/vitepress-theme/config";

export default defineXiHanConfig({
  title: "曦寒开发框架文档",
  repo: "XiHan.Framework",
});
```

::: code-group

```bash [pnpm]
pnpm add @xihanfun/vitepress-theme
```

```bash [npm]
npm install @xihanfun/vitepress-theme
```

:::

### 三级标题

三级标题用于把一节再拆成几小块，右侧目录会一并列出。

> 引用块：快速、轻量、高效、用心。
