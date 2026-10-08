// 文档站机读资产：llms.txt 索引、llms-full.txt 全站正文、按栏目的分册、每页一份 .md，
// 以及开发服务器上按需生成的单页 Markdown。内容从站点源文件现算，站点只登记栏目与分册。
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";

/**
 * @typedef {import("./config").XiHanLlmsOptions} XiHanLlmsOptions
 * @typedef {import("./config").XiHanLlmsPage} XiHanLlmsPage
 */

/** 拆出 frontmatter 与正文，frontmatter 保留原文。 */
function splitFrontmatter(source) {
  const hit = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  return hit
    ? { frontmatter: hit[1], body: source.slice(hit[0].length) }
    : { frontmatter: "", body: source };
}

/** frontmatter 里某个顶层键的标量值。 */
function frontmatterValue(frontmatter, key) {
  const hit = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(frontmatter);
  return hit ? hit[1].trim().replace(/^["']|["']$/g, "") : "";
}

/** 源路径 → 站点地址（cleanUrls，index.md 落在目录上）。 */
function urlOf(site, rel) {
  return `${site}/${rel.replace(/\.md$/, "").replace(/(^|\/)index$/, "$1")}`;
}

const HTML_ENTITIES = { lt: "<", gt: ">", amp: "&", quot: "\"", "#39": "'" };

/** 行内代码：内容自带反引号时加长定界符，贴边的反引号再垫一个空格。 */
function inlineCode(code) {
  const text = code.replace(/&(lt|gt|amp|quot|#39);/g, (_, name) => HTML_ENTITIES[name]);
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map(run => run.length));
  const ticks = "`".repeat(longest + 1);
  const pad = text.startsWith("`") || text.endsWith("`") ? " " : "";
  return `${ticks}${pad}${text}${pad}${ticks}`;
}

/**
 * 压平只给 VitePress 看的写法：<code v-pre> 改成行内代码，<Badge text="x" /> 改成行内代码，
 * [[toc]] 去掉。围栏代码块里是示例原文，不动。
 */
function flattenVitePressSyntax(body) {
  const out = [];
  let fence = "";
  for (const line of body.split(/\r?\n/)) {
    const marker = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    if (marker) {
      if (!fence)
        fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim())
        fence = "";
      out.push(line);
      continue;
    }
    if (fence) {
      out.push(line);
      continue;
    }
    if (/^\s*\[\[toc\]\]\s*$/i.test(line))
      continue;
    out.push(line
      .replace(/<code v-pre>([\s\S]*?)<\/code>/g, (_, code) => inlineCode(code))
      .replace(/<Badge[^>]+\btext="([^"]+)"[^>]*\/>/g, (_, text) => inlineCode(text)));
  }
  return out.join("\n");
}

/** 一句话描述：一级标题之后的第一段正文，压成单行并截到一句。 */
function summaryOf(text) {
  const prose = text
    .replace(/^(`{3,}|~{3,}).*\n[\s\S]*?^\1[ \t]*$/gm, "")
    .replace(/^# .*$/m, "");
  for (const block of prose.split(/\n\s*\n/)) {
    const paragraph = block.trim();
    if (!paragraph || /^(#|<|:::|\||!\[|-{3,}$)/.test(paragraph))
      continue;
    const flat = paragraph
      .replace(/^>\s?/gm, "")
      .replace(/\s+/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    const stop = flat.indexOf("。");
    if (stop !== -1 && stop < 200)
      return flat.slice(0, stop + 1);
    return flat.length > 160 ? `${flat.slice(0, 160)}…` : flat;
  }
  return "";
}

/**
 * 读出一页：机读正文、标题与一句话描述。
 * @param {string} site
 * @param {string} rel
 * @param {string} source
 * @param {XiHanLlmsOptions} options
 * @returns {Promise<XiHanLlmsPage>}
 */
async function readPage(site, rel, source, options) {
  const { frontmatter, body } = splitFrontmatter(source);
  const transformed = options.transform ? await options.transform(body, rel) : body;
  let text = flattenVitePressSyntax(transformed).trim();
  // 首页正文是空的，内容全在 frontmatter 的 hero 与 features 里
  if (!text && frontmatter)
    text = `\`\`\`yaml\n${frontmatter.trim()}\n\`\`\``;
  // 标题取一级标题行的纯文本：<code v-pre> 保留为行内代码，徽章等标签去掉
  const heading = /^# +(\S.*)$/m.exec(transformed)?.[1]
    .replace(/<code v-pre>([\s\S]*?)<\/code>/g, (_, code) => inlineCode(code))
    .replace(/<[^>]+>/g, "")
    .trim();
  return {
    rel,
    section: rel.includes("/") ? rel.slice(0, rel.indexOf("/")) : ".",
    url: urlOf(site, rel),
    title: heading || frontmatterValue(frontmatter, "title") || rel,
    summary: summaryOf(text) || frontmatterValue(frontmatter, "titleTemplate"),
    text,
  };
}

/** 一页的形态：来源地址 + 正文，正文不以一级标题开头时补一个。 */
function pageBlock(page) {
  const heading = page.text.startsWith("# ") ? "" : `# ${page.title}\n\n`;
  return `来源：${page.url}\n\n${heading}${page.text}\n`;
}

/**
 * 站点地址：选项优先，否则取站点根 package.json 的 homepage。
 * @param {string} root
 * @param {XiHanLlmsOptions} options
 */
export async function resolveSite(root, options) {
  if (options.site)
    return options.site.replace(/\/+$/, "");
  const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  if (!manifest.homepage)
    throw new Error("[llms] 没有站点地址：在 llms.site 里写明，或在文档站 package.json 里写 homepage");
  return manifest.homepage.replace(/\/+$/, "");
}

/**
 * 按需生成与构建产物相同的单页 Markdown；路径越界或页面不存在时返回 null。
 * @param {string} srcDir
 * @param {string} site
 * @param {string} relativePath
 * @param {XiHanLlmsOptions} options
 */
export async function renderPageMarkdown(srcDir, site, relativePath, options) {
  const rel = relativePath.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!rel.endsWith(".md") || rel.split("/").includes(".."))
    return null;
  let source;
  try {
    source = await readFile(join(srcDir, rel), "utf8");
  }
  catch (error) {
    if (error && error.code === "ENOENT")
      return null;
    throw error;
  }
  return pageBlock(await readPage(site, rel, source, options));
}

/**
 * 写出全部机读资产：每页 .md、llms.txt、llms-full.txt、各分册与站点追加的资产。
 * @param {{ root: string, srcDir: string, outDir: string, pages: string[] }} siteConfig
 * @param {XiHanLlmsOptions} options
 */
export async function writeLlmsAssets(siteConfig, options) {
  const { root, srcDir, outDir } = siteConfig;
  const site = await resolveSite(root, options);
  const sections = options.sections ?? [];
  const pages = [];
  for (const rel of [...siteConfig.pages].sort())
    pages.push(await readPage(site, rel, await readFile(join(srcDir, rel), "utf8"), options));

  const order = sections.map(section => section.dir);
  const rank = dir => (order.includes(dir) ? order.indexOf(dir) : order.length);
  const dirs = [...new Set(pages.map(page => page.section))]
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const pagesIn = list => pages.filter(page => list.includes(page.section));
  const labelOf = dir => sections.find(section => section.dir === dir)?.label ?? dir;

  const bundles = (options.bundles ?? []).map(bundle => ({ ...bundle, list: pagesIn(bundle.dirs) }));
  // 分册一页都没有，说明目录改名或登记写错
  for (const bundle of bundles) {
    if (bundle.list.length === 0)
      throw new Error(`[llms] 分册 llms-${bundle.name}.txt（${bundle.label}）没有任何页面，检查 bundles 登记的 dirs`);
  }

  await mkdir(outDir, { recursive: true });

  // 每页一份 .md：正文上方「取本页 Markdown」的直链指向它
  for (const page of pages) {
    const target = join(outDir, page.rel);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, pageBlock(page), "utf8");
  }

  const extra = options.assets ? (await options.assets({ outDir, site, pages })) ?? [] : [];

  const sample = pages.find(page => page.section !== "." && !page.rel.endsWith("index.md"));
  const index = [
    `# ${options.title}`,
    "",
    `> ${options.summary}`,
    "",
    "本文件由文档站构建期生成，内容与仓库文档同源。",
    "",
    "## 机读资产",
    "",
    `- [llms-full.txt](${site}/llms-full.txt): 全部 ${pages.length} 页正文${options.fullDescription ? `，${options.fullDescription}` : ""}`,
    ...bundles.map(bundle => `- [llms-${bundle.name}.txt](${site}/llms-${bundle.name}.txt): ${bundle.list.length} 页${bundle.label}`),
    ...extra.map(asset => `- [${asset.name}](${site}/${asset.name}): ${asset.description}`),
    ...(sample ? [`- 每页 Markdown：把站点地址后缀成 \`.md\`，如 ${sample.url}.md`] : []),
    "",
  ];
  for (const dir of dirs) {
    index.push(`## ${labelOf(dir)}`, "");
    for (const page of pagesIn([dir]))
      index.push(`- [${page.title}](${page.url})${page.summary ? `: ${page.summary}` : ""}`);
    index.push("");
  }

  const compile = (title, description, list) => [
    [`# ${options.title} · ${title}`, "", `共 ${list.length} 页。${description ?? ""}`, `索引见 ${site}/llms.txt`, ""].join("\n"),
    ...list.map(pageBlock),
  ].join("\n---\n\n");

  await writeFile(join(outDir, "llms.txt"), index.join("\n"), "utf8");
  await writeFile(join(outDir, "llms-full.txt"), compile("全站正文", options.fullDescription, pagesIn(dirs)), "utf8");
  for (const bundle of bundles)
    await writeFile(join(outDir, `llms-${bundle.name}.txt`), compile(bundle.label, bundle.description, bundle.list), "utf8");

  console.log(
    `[llms] ${pages.length} 页${bundles.map(bundle => ` · ${bundle.label} ${bundle.list.length}`).join("")}${extra.map(asset => ` · ${asset.name}`).join("")} → ${relative(root, outDir).split(sep).join("/")}`,
  );
}
