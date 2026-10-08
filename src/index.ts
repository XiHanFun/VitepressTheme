import type { EnhanceAppContext, Theme } from "vitepress";
import type { VNode } from "vue";
import type { XiHanResolvedOptions, XiHanStarPromptOptions } from "./options";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import XhAsidePromotions from "./components/XhAsidePromotions.vue";
import XhBanner from "./components/XhBanner.vue";
import XhPageMarkdown from "./components/XhPageMarkdown.vue";
import XhStarPrompt from "./components/XhStarPrompt.vue";
import { DEFAULT_PROMOTIONS_URL, xihanOptionsKey } from "./options";
import "./styles/vars.css";
import "./styles/layout.css";
import "./styles/base.css";

/** 默认布局插槽的渲染函数 */
export type XiHanLayoutSlot = () => VNode | VNode[] | null | undefined;

/** 主题选项 */
export interface XiHanThemeOptions {
  /** 正文上方显示「取本页 Markdown」直链，配合配置项 llms 生成同路径的 .md */
  pageMarkdown?: boolean;
  /** 运营数据（公告横幅、赞助位、广告位）的 JSON 地址，缺省读组织门户发布的那份，false 关闭三者 */
  promotions?: string | false;
  /** GitHub Star 提示，缺省开启并取导航栏 GitHub 链接指向的仓库，false 关闭 */
  starPrompt?: XiHanStarPromptOptions | false;
  /** 填入默认布局的插槽，渲染在主题自带内容之后 */
  slots?: Record<string, XiHanLayoutSlot>;
  /** 在默认主题的 enhanceApp 之后执行 */
  enhanceApp?: (ctx: EnhanceAppContext) => void | Promise<void>;
}

/** 把主题与站点给同一插槽的内容依次排开 */
function composeSlots(...sources: Record<string, XiHanLayoutSlot | false | undefined>[]): Record<string, () => (VNode | VNode[] | null | undefined)[]> {
  const names = new Set(sources.flatMap(source => Object.keys(source)));
  const slots: Record<string, () => (VNode | VNode[] | null | undefined)[]> = {};
  for (const name of names) {
    const renders = sources.map(source => source[name]).filter((render): render is XiHanLayoutSlot => !!render);
    slots[name] = () => renders.map(render => render());
  }
  return slots;
}

/** 创建曦寒文档主题 */
export function defineXiHanTheme(options: XiHanThemeOptions = {}): Theme {
  const resolved: XiHanResolvedOptions = {
    promotions: options.promotions === undefined ? DEFAULT_PROMOTIONS_URL : options.promotions,
    starPrompt: options.starPrompt === undefined ? {} : options.starPrompt,
  };

  const slots = composeSlots(
    {
      "layout-top": resolved.promotions !== false && (() => h(XhBanner)),
      "doc-before": options.pageMarkdown && (() => h(XhPageMarkdown)),
      "aside-outline-after": resolved.promotions !== false && (() => h(XhAsidePromotions)),
      "layout-bottom": resolved.starPrompt !== false && (() => h(XhStarPrompt)),
    },
    options.slots ?? {},
  );

  return {
    extends: DefaultTheme,
    Layout: () => h(DefaultTheme.Layout, null, slots),
    async enhanceApp(ctx) {
      ctx.app.provide(xihanOptionsKey, resolved);
      await options.enhanceApp?.(ctx);
    },
  };
}

export type { XiHanAd, XiHanBanner, XiHanPromotions, XiHanSponsor } from "./composables/promotions";
export type { XiHanStarPromptOptions } from "./options";
export { XhPageMarkdown };

export default defineXiHanTheme();
