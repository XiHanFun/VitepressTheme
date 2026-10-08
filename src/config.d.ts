import type { DefaultTheme, UserConfig } from "vitepress";

/** 曦寒文档站配置项：VitePress 站点配置加上几项共用约定 */
export interface XiHanConfigOptions extends UserConfig<DefaultTheme.Config> {
  /** XiHanFun 组织下的仓库名，如 XiHan.Framework；生成社交链接与「在 GitHub 上编辑此页」地址，省略时社交链接指向组织主页 */
  repo?: string;
  /** 页面 keywords 元信息 */
  keywords?: string;
  /** 开发服务器按需生成 /__markdown/<页面路径> 的 Markdown，与主题选项 pageMarkdown 配套；返回 null 时响应 404 */
  pageMarkdown?: (relativePath: string) => Promise<string | null>;
}

/** 创建曦寒文档站配置：在站点配置之下垫上共用的语言、文案、搜索、页脚与构建设置 */
export declare function defineXiHanConfig(
  options: XiHanConfigOptions,
): UserConfig<DefaultTheme.Config>;
