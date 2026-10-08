import type { DefaultTheme } from "vitepress";
import { defineXiHanConfig } from "@xihanfun/vitepress-theme/config";

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
  llms: {
    // 预览站不部署，地址指向 vitepress preview 的本地服务
    site: "http://localhost:4173",
    title: "曦寒文档主题",
    summary: "曦寒各文档站共用的 VitePress 主题：配色、版式、正文组件与中文站点默认配置。",
    sections: [
      { dir: ".", label: "开始" },
      { dir: "guide", label: "预览" },
    ],
    bundles: [{ name: "guide", label: "预览", dirs: ["guide"] }],
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
