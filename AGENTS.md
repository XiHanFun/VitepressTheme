# AGENTS.md

本文件约束在 VitepressTheme 仓库内工作的 AI Agent。回答、文档与提交说明使用中文；代码标识、公开 API 与标准技术术语保持英文。

## 仓库概览

VitepressTheme 是曦寒各文档站共用的 VitePress 主题，npm 包名 `@xihanfun/vitepress-theme`（MIT）。组织门户 XiHan.Docs 与各产品仓库的 `docs/`（开发框架、视图组件、基础应用与四款设计器）都消费它的 npm 正式包，保持同一套配色、版式与站点默认配置。

包直接发布源码：`exports` 的 `.` 指向 `src/index.ts`，由站点的 Vite 编译；`./config` 指向 `src/config.js`，在站点的 Node 配置阶段直接加载，所以写成 JS 并配一份 `config.d.ts`。

### 技术栈

| 技术 | 要求 | 用途 |
| --- | --- | --- |
| Node.js | 24+ | 构建与发布 |
| pnpm | 11+ | 预览站包管理 |
| VitePress | peer `^2.0.0-alpha.20`；预览站写精确版本 | 主题宿主 |
| Vue | peer `^3.5.0` | 主题组件 |
| TypeScript | 由站点的 Vite 编译 | 主题入口与组件 |

## 开始前必须做

1. 按任务读取对应技能：样式、正文组件、站点默认配置与验证读取 `.agents/skills/theme-development/SKILL.md`；提交、PR、更新日志、Issue 与发版各有对应技能，见 `.agents/skills/`。
2. 检查当前分支、`git status --short --branch` 和最近提交；保留用户已有改动。
3. 先确认要改的东西归主题还是归某个文档站（见「职责与边界」）；归站点的不在这里改。
4. 查各文档站当前用的主题版本与 `vitepress` 版本（各站 `docs/package.json`），改动会影响哪些站要心里有数。

## 职责与边界

主题负责各文档站共同的部分：

- 配色、版式与细节样式：品牌色与明暗两套取值、全宽版式、侧边栏、滚动条、本地搜索结果、导航徽章 `.xh-nav-badge`。
- 正文组件：「取本页 Markdown」直链、公告横幅、赞助位与广告位、GitHub Star 提示、可全屏的示例 `XhFullscreen`。
- 站点默认配置（`defineXiHanConfig`）：中文界面文案、本地搜索中文文案、目录与翻页、页脚、作者与图标元信息、按仓库名生成的社交链接与编辑链接，以及机读资产（`llms.txt` 等）。

留在各站自己 `docs/.vitepress/` 的：导航、侧栏、示例组件与产品专属样式。站点不复制或局部改写主题已提供的样式；发现主题样式有缺陷，回到这里修，再发版让各站升级。

赞助位与广告位的运营数据由组织门户发布在 `docs/public/data/promotions.json`，主题运行时读取；公告横幅由各站在 `defineXiHanConfig` 的 `banner` 里自己写。

## 目录结构

```text
/
├─ AGENTS.md
├─ CLAUDE.md -> AGENTS.md          # Claude Code 仓库指令入口
├─ .agents/skills/                 # 仓库技能
├─ .claude/skills -> ../.agents/skills
├─ .github/workflows/              # ci.yml 构建预览站，release.yml 发布到 npm
├─ src/
│  ├─ index.ts                     # 主题入口：defineXiHanTheme
│  ├─ config.js / config.d.ts      # 站点配置：defineXiHanConfig（Node 直接加载，写成 JS）
│  ├─ llms.js                      # 机读资产生成
│  ├─ options.ts                   # 主题运行时选项
│  ├─ labels.js / labels.d.ts      # 主题组件的中文界面文案
│  ├─ composables/                 # 运营数据读取
│  ├─ components/                  # 正文组件（Vue SFC）
│  └─ styles/                      # vars 配色 / layout 版式 / base 细节
├─ playground/                     # 预览站，以 link:.. 引用本仓库源码
├─ CHANGELOG.md                    # 更新日志（手写，随包发布）
└─ package.json                    # @xihanfun/vitepress-theme
```

## 常用命令

仓库根的 `pnpm dev`、`pnpm build` 转到 `playground/` 执行。预览站自己的命令在 `playground/`：

| 任务 | 命令（在 `playground/`） |
| --- | --- |
| 安装 | `pnpm install`（仓库不入库锁文件，见 `.gitignore`） |
| 开发 | `pnpm dev` |
| 构建 | `pnpm build`（CI 以它验证主题可用） |
| 预览产物 | `pnpm preview` |

仓库没有单独的 lint 与类型检查脚本；主题的 TypeScript 与 Vue 由预览站构建时编译，构建失败即主题坏了。

## 验证

1. 先在 `playground/` 跑 `pnpm build`，并用 `pnpm dev` 看受影响的页面（明暗两色、窄屏）。预览站要能覆盖这次改的东西，覆盖不到就在预览站补页面或配置。
2. 再验证受影响的文档站：把该站 `docs/package.json` 里的 `@xihanfun/vitepress-theme` 临时改成指向本仓库的 `link:`（如 `link:../../VitepressTheme`），装依赖后构建、看页面；验完把 `package.json` 与锁文件一起改回，不提交临时链接。
3. 各站默认消费 npm 正式包，同级目录里的主题源码不会自动生效；没发版的改动只能经临时 `link:` 看到。

## 硬性约定

- **VitePress 版本**：VitePress 2 预发布期间，各站与预览站的 `vitepress` 写同一个精确版本，主题的 peer 写 `^` 下限；升级时主题、预览站与各站一起改。
- **配置合并**：站点写的 `themeConfig` 字段覆盖同名默认值，`buildEnd` 先于机读资产执行，`head` 追加在默认项之后，`vite.plugins` 追加在内置插件之后，`vite.resolve.dedupe`、`vite.ssr.noExternal`、`vite.optimizeDeps.exclude` 与主题需要的取值合并。改合并规则即改各站的行为，按破坏性变更对待。
- **界面文案**：主题组件的中文文案集中在 `labels.js`，站点可在 `themeConfig` 里用同名字段覆盖；新增文案同时补 `labels.d.ts` 与 `XiHanThemeConfig` 的类型。
- **样式**：配色经 `vars.css` 里的 `--xh-doc-*` 接到 VitePress 的 `--vp-*` 变量；追平默认主题选择器特异性用「类名写两遍」，不加 `!important`。站点样式在导入主题之后导入，同等特异性下站点覆盖主题。
- **服务端渲染**：组件在模块顶层与 `setup` 同步阶段不碰 `window`、`document`、`localStorage`，浏览器能力在 `onMounted` 之后判断；页面渲染前就要定的东西（如公告是否占位）经 `head` 里的内联脚本处理。
- **本机存储**：键名一律 `xh-docs-` 前缀，组件经 `composables/promotions.ts` 的 `storage` 读写（存储不可用时静默按默认行为走），不直接碰 `localStorage`。
- **网络**：主题只读运营数据（`promotions` 可关）与 GitHub 仓库的 Star 数，读不到时静默不显示，不阻塞页面。
- **注释**：只写代码做什么，不写为什么这样设计、也不写任何参考项目名称；设计理由写进提交说明。
- **文档**：README 与更新日志不写使用主题的站点个数与依赖的具体版本号（安装说明里的精确 `vitepress` 版本除外）。

## 发版

主题不用 changesets，版本手工定；main 上的 `v<版本>` 标签触发 `.github/workflows/release.yml` 发 npm。

1. 改 `package.json` 的 `version`，在 `CHANGELOG.md` 写这一版的一节（标题 `## v<版本>（YYYY-MM-DD）`，条目标 **新增 / 修复 / 优化 / 调整 / 移除**，只收站点作者与读者可感知的变更，仓库配置与 CI 不列）。
2. `playground/` 跑 `pnpm build`，`git diff --check`，提交 `build: v<版本>` 到 `dev`。
3. 推 dev，等 CI（`ci.yml`，构建预览站）通过；main 从 dev 快进（不是快进就停下查），推 main。
4. 在版本提交上打 `v<版本>` 标签并推送。`release.yml` 先核对标签在 main 的历史里、标签号等于 `package.json` 的版本，再构建预览站，最后 `npm publish`（`publishConfig.provenance` 打开，需要仓库 Secrets 的 `NPM_TOKEN`）。
5. 发完用 `npm view @xihanfun/vitepress-theme version --registry https://registry.npmjs.org` 核对，再到各文档站升级依赖（各站单独提交）。

合并 main、打标签、发布都只在用户明确要求时执行。

## 分支与 worktree

- 主检出上的日常改动直接提交到 `dev`；`main` 只接收发版。
- 开 worktree 时分支按用途分组：`feat/<名>`、`fix/<名>`、`issue/<编号>`、`pr/<编号>-review`；工具生成的 `claude/<名>` 等分支在首次提交前改名。
- worktree 分支的合并、推送、PR 以及删除，只在用户明确要求时执行。

## Git 与提交

- 保留用户已有和无关改动；不要 reset、checkout 或清理它们。
- 使用 Conventional Commits：`<type>: <中文说明>`，scope 可省；发版提交写 `build: v<版本>`。
- 一项完整改动一个提交；提交前跑 `playground/` 的 `pnpm build` 与 `git diff --check`。
- 不推送、不发布、不创建远程 PR，除非用户明确要求。

## 禁止事项

- 不把某个站点专属的导航、侧栏、示例组件或样式放进主题。
- 不在站点里复制或局部改写主题样式来绕开主题缺陷。
- 不提交指向本地路径的临时 `link:`。
- 不添加静默兜底和推测性兼容；改名或删除主题选项按破坏性变更处理，在更新日志里写明迁移。
- 不手改 `.vitepress/dist` 等构建产物。
