import { renderPageMarkdown, resolveSite, writeLlmsAssets } from "./llms.js";

/** 本包名，用于让 Vite 编译主题源码而不是当作预构建依赖 */
const PACKAGE_NAME = "@xihanfun/vitepress-theme";

/** GitHub、Gitee、GitCode 三个托管平台上的组织地址 */
const ORG_HOSTS = [
  { icon: "github", url: "https://github.com/XiHanFun" },
  { icon: "gitee", url: "https://gitee.com/XiHanFun" },
  { icon: "gitcode", url: "https://gitcode.com/XiHanFun" },
];

/** 本地搜索的中文文案 */
const localSearchTranslations = {
  button: {
    buttonText: "搜索文档",
    buttonAriaLabel: "搜索文档",
  },
  modal: {
    displayDetails: "显示详细列表",
    resetButtonTitle: "清除查询条件",
    backButtonTitle: "关闭搜索",
    noResultsText: "无法找到相关结果",
    footer: {
      selectText: "选择",
      selectKeyAriaLabel: "回车",
      navigateText: "切换",
      navigateUpKeyAriaLabel: "上方向键",
      navigateDownKeyAriaLabel: "下方向键",
      closeText: "关闭",
      closeKeyAriaLabel: "Esc",
    },
  },
};

/**
 * 社交链接：给了仓库名指向该仓库，否则指向组织主页。
 * @param {string | undefined} repo
 */
function socialLinksOf(repo) {
  return ORG_HOSTS.map(({ icon, url }) => ({
    icon,
    link: repo ? `${url}/${repo}` : url,
  }));
}

/**
 * 站点主题配置的默认值。
 * @param {string | undefined} repo
 */
function defaultThemeConfig(repo) {
  return {
    logo: "/images/logo.png",
    socialLinks: socialLinksOf(repo),
    search: {
      provider: "local",
      options: { translations: localSearchTranslations },
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    outline: {
      label: "目录",
      level: "deep",
    },
    langMenuLabel: "多语言",
    navMenuLabel: "主导航",
    mobileMenuLabel: "菜单",
    extraMenuLabel: "更多",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    skipToContentLabel: "跳转到内容",
    notFound: {
      title: "页面未找到",
      quote: "但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。",
      linkLabel: "前往首页",
      linkText: "带我回首页",
    },
    ...(repo
      ? {
          editLink: {
            text: "在 GitHub 上编辑此页",
            pattern: `https://github.com/XiHanFun/${repo}/tree/main/docs/:path`,
          },
        }
      : {}),
    lastUpdated: {
      text: "最后更新于",
    },
    footer: {
      message:
        "Released under The <a href='https://opensource.org/license/MIT' target='_blank'>MIT</a> License",
      copyright:
        "Copyright ©2021-Present <a href='https://www.xihanfun.com' target='_blank'>XiHanFun</a> and contributors.",
    },
  };
}

/**
 * 站点 head 的默认项：作者、关键词与站点图标。
 * @param {string | undefined} keywords
 */
function defaultHead(keywords) {
  return [
    ["meta", { name: "author", content: "XiHanFun" }],
    ...(keywords ? [["meta", { name: "keywords", content: keywords }]] : []),
    ["link", { rel: "icon", href: "/favicon.ico" }],
  ];
}

/** 读者关闭过的公告标识在 localStorage 里的键 */
const BANNER_DISMISSED_KEY = "xh-docs-banner-dismissed";

/**
 * 公告横幅的 head 脚本：页面渲染前按读者是否关闭过这条公告决定是否占位，避免加载后页面下移。
 * @param {import("./config").XiHanBanner} banner
 */
function bannerHead(banner) {
  const id = JSON.stringify(banner.id);
  const key = JSON.stringify(BANNER_DISMISSED_KEY);
  return ["script", {}, `(()=>{let d=null;try{d=localStorage.getItem(${key})}catch{}if(d!==${id})document.documentElement.classList.add("xh-banner-open")})()`];
}

/**
 * 开发服务器上按需生成 /__markdown/<页面路径> 的 Markdown，与构建产物里的单页 .md 相同。
 * @param {import("./config").XiHanLlmsOptions} llms
 */
function pageMarkdownPlugin(llms) {
  return {
    name: "xihan-doc-page-markdown",
    configureServer(server) {
      const site = server.config.vitepress ?? { root: server.config.root, srcDir: server.config.root };
      let siteUrl;
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
        const prefix = "/__markdown/";
        if (!pathname.startsWith(prefix)) {
          next();
          return;
        }
        try {
          siteUrl ??= await resolveSite(site.root, llms);
          const markdown = await renderPageMarkdown(site.srcDir, siteUrl, decodeURIComponent(pathname.slice(prefix.length)), llms);
          if (markdown === null) {
            response.statusCode = 404;
            response.end("Not Found");
            return;
          }
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/markdown; charset=utf-8");
          response.end(markdown);
        }
        catch (error) {
          next(error);
        }
      });
    },
  };
}

/**
 * 把本包追加进 Vite 的名单类选项，保留站点自己写的取值。
 * @param {unknown} value
 */
function withPackage(value) {
  if (value === true)
    return true;
  const list = value === undefined ? [] : Array.isArray(value) ? value : [value];
  return list.includes(PACKAGE_NAME) ? list : [...list, PACKAGE_NAME];
}

/**
 * vue 一律从站点根解析，主题以 link: 引用时也与站点共用同一份。
 * @param {string[] | undefined} dedupe
 */
function dedupeVue(dedupe) {
  const list = dedupe ?? [];
  return list.includes("vue") ? list : [...list, "vue"];
}

/**
 * 创建曦寒文档站配置：在站点配置之下垫上共用的语言、文案、搜索、页脚与构建设置。
 * @param {import("./config").XiHanConfigOptions} options
 * @returns {import("vitepress").UserConfig<import("vitepress").DefaultTheme.Config>}
 */
export function defineXiHanConfig(options) {
  const { repo, keywords, banner, llms, head, themeConfig, vite, buildEnd, ...site } = options;
  const userVite = vite ?? {};

  return {
    lang: "zh-CN",
    lastUpdated: true,
    cleanUrls: true,
    ...site,
    head: [...defaultHead(keywords), ...(banner ? [bannerHead(banner)] : []), ...(head ?? [])],
    // 站点自己的 buildEnd 先跑，它抛错时不再产出机读资产
    async buildEnd(siteConfig) {
      await buildEnd?.(siteConfig);
      if (llms)
        await writeLlmsAssets(siteConfig, llms);
    },
    themeConfig: {
      ...defaultThemeConfig(repo),
      ...themeConfig,
      banner: banner ?? null,
    },
    vite: {
      ...userVite,
      plugins: [
        ...(llms ? [pageMarkdownPlugin(llms)] : []),
        ...(userVite.plugins ?? []),
      ],
      resolve: {
        ...userVite.resolve,
        dedupe: dedupeVue(userVite.resolve?.dedupe),
      },
      ssr: {
        ...userVite.ssr,
        noExternal: withPackage(userVite.ssr?.noExternal),
      },
      optimizeDeps: {
        ...userVite.optimizeDeps,
        exclude: withPackage(userVite.optimizeDeps?.exclude),
      },
    },
  };
}
