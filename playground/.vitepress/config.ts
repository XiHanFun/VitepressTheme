import type { DefaultTheme } from "vitepress";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineXiHanConfig } from "@xihanfun/vitepress-theme/config";

const root = fileURLToPath(new URL("..", import.meta.url));

/** 读取页面源文件，供开发服务器上的「取本页 Markdown」使用 */
async function renderPageMarkdown(relativePath: string): Promise<string | null> {
  if (!relativePath.endsWith(".md") || relativePath.split("/").includes(".."))
    return null;
  try {
    return await readFile(join(root, relativePath), "utf8");
  }
  catch {
    return null;
  }
}

const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "预览",
    items: [
      { text: "正文排版", link: "/guide/" },
      { text: "提示块与徽章", link: "/guide/blocks" },
    ],
  },
];

const nav: DefaultTheme.NavItem[] = [
  {
    text: "预览<span class=\"xh-nav-badge xh-nav-badge--tip\">稳定版</span>",
    link: "/guide/",
    activeMatch: "/guide/",
  },
  {
    text: "文档站",
    items: [
      { text: "组织文档", link: "https://docs.xihanfun.com" },
      { text: "开发框架", link: "https://framework.docs.xihanfun.com" },
      { text: "视图组件", link: "https://ui.docs.xihanfun.com" },
      { text: "基础应用", link: "https://basicapp.docs.xihanfun.com" },
    ],
  },
];

export default defineXiHanConfig({
  title: "曦寒文档主题",
  description: "曦寒各文档站共用的 VitePress 主题",
  keywords: "曦寒,曦寒懿,文档主题,VitePress,XiHanFun",
  repo: "VitepressTheme",
  pageMarkdown: renderPageMarkdown,
  // 产物里放一份同路径的页面源文件，对应正文上方的「取本页 Markdown」
  async buildEnd(siteConfig) {
    for (const page of siteConfig.pages) {
      const target = join(siteConfig.outDir, page);
      await mkdir(dirname(target), { recursive: true });
      await copyFile(join(siteConfig.srcDir, page), target);
    }
  },
  themeConfig: {
    nav,
    sidebar,
    editLink: {
      text: "在 GitHub 上编辑此页",
      pattern: "https://github.com/XiHanFun/VitepressTheme/tree/main/playground/:path",
    },
  },
});
