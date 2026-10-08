import type { DefaultTheme, UserConfig } from "vitepress";

/** 栏目：一个顶层目录在 llms.txt 索引里的名字与排位 */
export interface XiHanLlmsSection {
  /** 顶层目录名；站点根目录下的页面用 "." */
  dir: string;
  /** 索引里的栏目名 */
  label: string;
}

/** 分册：几个顶层目录汇编成一份 llms-<name>.txt */
export interface XiHanLlmsBundle {
  /** 文件名里的分册名 */
  name: string;
  /** 分册标题 */
  label: string;
  /** 收进本分册的顶层目录 */
  dirs: string[];
  /** 写在分册开头的说明 */
  description?: string;
}

/** 读出的一页 */
export interface XiHanLlmsPage {
  /** 相对站点源目录的路径 */
  rel: string;
  /** 顶层目录名，根目录为 "." */
  section: string;
  url: string;
  title: string;
  summary: string;
  /** 机读正文 */
  text: string;
}

/** 站点追加的资产，登记进 llms.txt 的「机读资产」 */
export interface XiHanLlmsAsset {
  /** 相对站点根的文件名 */
  name: string;
  description: string;
}

/** 机读资产：llms.txt、llms-full.txt、分册与每页 .md */
export interface XiHanLlmsOptions {
  /** llms.txt 的一级标题 */
  title: string;
  /** 一段话简介，作标题下的引用块 */
  summary: string;
  /** 站点地址，缺省取文档站 package.json 的 homepage */
  site?: string;
  /** 栏目按此顺序排列；未登记的目录排在末尾，以目录名作栏目名 */
  sections?: XiHanLlmsSection[];
  /** 另外汇编的分册 */
  bundles?: XiHanLlmsBundle[];
  /** llms-full.txt 的补充说明 */
  fullDescription?: string;
  /** 改写单页正文（已去掉 frontmatter），如把站点自定义组件换成纯 Markdown */
  transform?: (body: string, rel: string) => string | Promise<string>;
  /** 写出站点特有的资产，返回要登记进索引的条目 */
  assets?: (context: { outDir: string; site: string; pages: XiHanLlmsPage[] }) => XiHanLlmsAsset[] | void | Promise<XiHanLlmsAsset[] | void>;
}

/** 曦寒文档站配置项：VitePress 站点配置加上几项共用约定 */
export interface XiHanConfigOptions extends UserConfig<DefaultTheme.Config> {
  /** XiHanFun 组织下的仓库名，如 XiHan.Framework；生成社交链接与「在 GitHub 上编辑此页」地址，省略时社交链接指向组织主页 */
  repo?: string;
  /** 页面 keywords 元信息 */
  keywords?: string;
  /** 构建期产出机读资产，并在开发服务器上提供 /__markdown/<页面路径>，与主题选项 pageMarkdown 配套 */
  llms?: XiHanLlmsOptions;
}

/** 创建曦寒文档站配置：在站点配置之下垫上共用的语言、文案、搜索、页脚与构建设置 */
export declare function defineXiHanConfig(
  options: XiHanConfigOptions,
): UserConfig<DefaultTheme.Config>;
