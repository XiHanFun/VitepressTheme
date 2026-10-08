import type { Ref } from "vue";
import { inBrowser } from "vitepress";
import { inject, onMounted, ref } from "vue";
import { xihanOptionsKey } from "../options";

/** 顶部公告横幅 */
export interface XiHanBanner {
  /** 公告标识，换一条公告就换一个值，读者关闭过的标识不再显示 */
  id: string;
  /** 公告文案 */
  text: string;
  /** 按钮跳转地址 */
  link?: string;
  /** 按钮文案，缺省为「了解详情」 */
  linkText?: string;
}

/** 赞助商 */
export interface XiHanSponsor {
  name: string;
  url: string;
  /** 标志图片，缺省时显示名称 */
  img?: string;
  /** large 独占一行，small 一行两个，缺省为 small */
  tier?: "large" | "small";
}

/** 广告 */
export interface XiHanAd {
  name: string;
  url: string;
  img?: string;
  /** 图片下方的说明 */
  text?: string;
}

/** 运营数据：公告横幅、赞助位与广告位 */
export interface XiHanPromotions {
  banner?: XiHanBanner | null;
  sponsors?: XiHanSponsor[];
  /** 「成为赞助商」入口地址 */
  sponsorLink?: string;
  ads?: XiHanAd[];
}

const cache = new Map<string, Promise<XiHanPromotions | null>>();

/** 读取运营数据；同一地址每次页面加载只请求一次，失败时按无数据处理 */
function load(url: string): Promise<XiHanPromotions | null> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url, { cache: "no-cache" })
      .then(response => (response.ok ? (response.json() as Promise<XiHanPromotions>) : null))
      .catch(() => null);
    cache.set(url, pending);
  }
  return pending;
}

/** 运营数据，只在浏览器里挂载后读取 */
export function usePromotions(): Ref<XiHanPromotions | null> {
  const options = inject(xihanOptionsKey, null);
  const data = ref<XiHanPromotions | null>(null);

  onMounted(async () => {
    if (!inBrowser || !options?.promotions)
      return;
    data.value = await load(options.promotions);
  });

  return data;
}

/** 读写 localStorage，存储不可用时静默降级 */
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    }
    catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    }
    catch {}
  },
};
