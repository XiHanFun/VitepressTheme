import { defineXiHanTheme } from "@xihanfun/vitepress-theme";

export default defineXiHanTheme({
  pageMarkdown: true,
  // 预览站读本地的示例运营数据
  promotions: "/data/promotions.json",
  starPrompt: { repo: "https://github.com/XiHanFun/VitepressTheme", name: "曦寒文档主题" },
});
