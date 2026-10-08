import type { InjectionKey } from "vue";

/** 运营数据的默认地址，由组织门户站发布 */
export const DEFAULT_PROMOTIONS_URL = "https://docs.xihanfun.com/data/promotions.json";

/** 赞助位入口的默认地址 */
export const DEFAULT_SPONSOR_LINK = "https://docs.xihanfun.com/cosmos/sponsor";

/** GitHub Star 提示选项 */
export interface XiHanStarPromptOptions {
  /** GitHub 仓库地址，省略时取导航栏 GitHub 社交链接 */
  repo?: string;
  /** 提示标题里的项目名，省略时取仓库名 */
  name?: string;
}

/** 运行时选项归一化后的结果 */
export interface XiHanResolvedOptions {
  promotions: string | false;
  starPrompt: XiHanStarPromptOptions | false;
}

export const xihanOptionsKey: InjectionKey<XiHanResolvedOptions> = Symbol("xihan-theme-options");
