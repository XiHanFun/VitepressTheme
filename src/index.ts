import type { EnhanceAppContext, Theme } from "vitepress";
import type { VNode } from "vue";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import XhPageMarkdown from "./components/XhPageMarkdown.vue";
import "./styles/vars.css";
import "./styles/layout.css";
import "./styles/base.css";

/** 默认布局插槽的渲染函数 */
export type XiHanLayoutSlot = () => VNode | VNode[] | null | undefined;

/** 主题选项 */
export interface XiHanThemeOptions {
  /** 正文上方显示「取本页 Markdown」直链，开发服务器的 /__markdown/ 路由由配置项 pageMarkdown 提供 */
  pageMarkdown?: boolean;
  /** 填入默认布局的插槽，与 pageMarkdown 占用的 doc-before 同名时以这里为准 */
  slots?: Record<string, XiHanLayoutSlot>;
  /** 在默认主题的 enhanceApp 之后执行 */
  enhanceApp?: (ctx: EnhanceAppContext) => void | Promise<void>;
}

/** 创建曦寒文档主题 */
export function defineXiHanTheme(options: XiHanThemeOptions = {}): Theme {
  const slots: Record<string, XiHanLayoutSlot> = {
    ...(options.pageMarkdown ? { "doc-before": () => h(XhPageMarkdown) } : {}),
    ...options.slots,
  };

  return {
    extends: DefaultTheme,
    Layout: () => h(DefaultTheme.Layout, null, slots),
    async enhanceApp(ctx) {
      await options.enhanceApp?.(ctx);
    },
  };
}

export { XhPageMarkdown };

export default defineXiHanTheme();
