<script setup lang="ts">
import type { DefaultTheme } from "vitepress";
import { useData, useRoute } from "vitepress";
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { storage } from "../composables/promotions";
import { xihanOptionsKey } from "../options";

const VISITED_KEY = "xh-docs-star-visited";
const SNOOZED_KEY = "xh-docs-star-snoozed-at";
const DISMISSED_KEY = "xh-docs-star-dismissed";
const OPENED_KEY = "xh-docs-star-opened-at";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const DWELL_TIME = 60 * 1000;
const VISITS_TO_PROMPT = 2;

const options = inject(xihanOptionsKey, null);
const { theme, frontmatter } = useData<DefaultTheme.Config>();
const route = useRoute();

const visible = ref(false);
const stars = ref<string | null>(null);
let dwellTimer: ReturnType<typeof setTimeout> | undefined;

/** 仓库地址：选项优先，否则取导航栏里指向具体仓库的 GitHub 链接 */
const repo = computed(() => {
  if (!options?.starPrompt)
    return null;
  if (options.starPrompt.repo)
    return options.starPrompt.repo;
  const github = theme.value.socialLinks?.find(link => link.icon === "github")?.link;
  if (!github)
    return null;
  const segments = new URL(github).pathname.split("/").filter(Boolean);
  return segments.length >= 2 ? github : null;
});

const name = computed(() => {
  if (options?.starPrompt && options.starPrompt.name)
    return options.starPrompt.name;
  return repo.value ? new URL(repo.value).pathname.split("/").filter(Boolean)[1] : "";
});

/** 千以上写成 1.2k */
function formatCount(count: number): string {
  return count < 1000 ? String(count) : `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

/** 读仓库当前的 Star 数，失败时不显示；同一会话只请求一次 */
async function loadStars(): Promise<void> {
  if (!repo.value)
    return;
  const [owner, project] = new URL(repo.value).pathname.split("/").filter(Boolean);
  const key = `xh-docs-star-count:${owner}/${project}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      stars.value = cached;
      return;
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${project}`);
    if (!response.ok)
      return;
    const { stargazers_count: count } = await response.json() as { stargazers_count?: number };
    if (typeof count !== "number")
      return;
    stars.value = formatCount(count);
    sessionStorage.setItem(key, stars.value);
  }
  catch {}
}

function blocked(): boolean {
  if (storage.get(DISMISSED_KEY) === "true")
    return true;
  const snoozedAt = Number(storage.get(SNOOZED_KEY) || 0);
  if (snoozedAt && Date.now() - snoozedAt < SEVEN_DAYS)
    return true;
  const openedAt = Number(storage.get(OPENED_KEY) || 0);
  return !!openedAt && Date.now() - openedAt < THIRTY_DAYS;
}

function tryShow(): void {
  if (!repo.value || visible.value || blocked())
    return;
  visible.value = true;
  void loadStars();
}

/** 记下读过的正文页，读满两页就提示 */
function recordVisit(path: string): void {
  if (frontmatter.value.layout === "home")
    return;
  let visited: string[] = [];
  try {
    visited = JSON.parse(storage.get(VISITED_KEY) || "[]");
  }
  catch {}
  const next = [...new Set([...visited, path])].slice(-20);
  storage.set(VISITED_KEY, JSON.stringify(next));
  if (next.length >= VISITS_TO_PROMPT)
    tryShow();
}

/** 从正文代码块或表格里复制内容时提示 */
function onCopy(event: ClipboardEvent): void {
  const target = event.target;
  if (target instanceof Element && target.closest(".vp-doc pre, .vp-doc table, .vp-doc code"))
    tryShow();
}

function snooze(): void {
  visible.value = false;
  storage.set(SNOOZED_KEY, Date.now().toString());
}

function dismissForever(): void {
  visible.value = false;
  storage.set(DISMISSED_KEY, "true");
}

function onStar(): void {
  visible.value = false;
  storage.set(OPENED_KEY, Date.now().toString());
}

onMounted(() => {
  recordVisit(route.path);
  document.addEventListener("copy", onCopy);
  dwellTimer = setTimeout(tryShow, DWELL_TIME);
});

onUnmounted(() => {
  document.removeEventListener("copy", onCopy);
  clearTimeout(dwellTimer);
});

watch(() => route.path, recordVisit);
</script>

<template>
  <Transition name="xh-star-prompt">
    <div v-if="visible && repo" class="xh-star-prompt" role="dialog" aria-live="polite" :aria-label="`${name} 帮到你了吗？`">
      <button class="xh-star-prompt__close" type="button" aria-label="关闭 Star 提示" @click="dismissForever">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>

      <div class="xh-star-prompt__head">
        <span class="xh-star-prompt__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M8 .25a.78.78 0 0 1 .7.44l1.9 3.86 4.26.62a.78.78 0 0 1 .43 1.33l-3.08 3 .73 4.24a.78.78 0 0 1-1.13.82L8 12.55l-3.81 2a.78.78 0 0 1-1.13-.82l.73-4.24-3.08-3a.78.78 0 0 1 .43-1.33l4.26-.62L7.3.69A.78.78 0 0 1 8 .25Z" />
          </svg>
        </span>
        <div class="xh-star-prompt__heading">
          <p class="xh-star-prompt__eyebrow">
            开源项目持续进化中
          </p>
          <p class="xh-star-prompt__title">
            {{ name }} 帮到你了吗？
          </p>
        </div>
      </div>

      <p class="xh-star-prompt__description">
        点亮一颗 GitHub Star，让更多开发者发现它。
      </p>

      <div class="xh-star-prompt__actions">
        <a class="xh-star-prompt__primary" :href="repo" target="_blank" rel="noreferrer" @click="onStar">
          <svg class="xh-star-prompt__github" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          <span>Star</span>
          <span v-if="stars" class="xh-star-prompt__count">{{ stars }}</span>
        </a>
        <button class="xh-star-prompt__secondary" type="button" @click="snooze">
          稍后再说
        </button>
        <button class="xh-star-prompt__text" type="button" @click="dismissForever">
          不再提示
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.xh-star-prompt {
  position: fixed;
  z-index: 60;
  right: 24px;
  bottom: 24px;
  box-sizing: border-box;
  width: min(360px, calc(100vw - 32px));
  padding: 18px 20px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  color: var(--vp-c-text-1);
  background:
    radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--vp-c-brand-1) 9%, transparent), transparent 60%),
    var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-4);
}

.xh-star-prompt__close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  color: var(--vp-c-text-3);
  background: transparent;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.xh-star-prompt__close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.xh-star-prompt__close svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.xh-star-prompt__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 24px;
}

.xh-star-prompt__icon {
  display: inline-flex;
  flex: none;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #d4910a;
  background: linear-gradient(160deg, #fff7d6, #ffe29a);
  box-shadow: inset 0 0 0 1px rgba(212, 145, 10, 0.16);
}

.dark .xh-star-prompt__icon {
  color: #f6c667;
  background: linear-gradient(160deg, rgba(246, 198, 103, 0.2), rgba(217, 154, 22, 0.08));
  box-shadow: inset 0 0 0 1px rgba(246, 198, 103, 0.18);
}

.xh-star-prompt__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.xh-star-prompt__heading {
  min-width: 0;
}

.xh-star-prompt__eyebrow {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}

.xh-star-prompt__title {
  margin: 0;
  overflow: hidden;
  color: var(--vp-c-text-1);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xh-star-prompt__description {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 22px;
}

.xh-star-prompt__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.xh-star-prompt__primary,
.xh-star-prompt__secondary,
.xh-star-prompt__text {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.xh-star-prompt__primary {
  gap: 6px;
  padding: 0 12px;
  border: 1px solid transparent;
  color: var(--vp-c-bg);
  background: var(--vp-c-text-1);
}

.xh-star-prompt__primary:hover {
  color: var(--vp-c-white);
  background: var(--vp-c-brand-1);
}

.xh-star-prompt__github {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

.xh-star-prompt__count {
  margin-left: 2px;
  padding-left: 8px;
  border-left: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  font-variant-numeric: tabular-nums;
}

.xh-star-prompt__secondary {
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: transparent;
}

.xh-star-prompt__secondary:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
}

.xh-star-prompt__text {
  margin-left: auto;
  padding: 0 4px;
  border: 0;
  color: var(--vp-c-text-3);
  background: transparent;
}

.xh-star-prompt__text:hover {
  color: var(--vp-c-text-1);
}

.xh-star-prompt-enter-active,
.xh-star-prompt-leave-active {
  transition: opacity 0.24s, transform 0.24s;
}

.xh-star-prompt-enter-from,
.xh-star-prompt-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

@media (max-width: 767px) {
  .xh-star-prompt {
    right: 16px;
    bottom: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .xh-star-prompt-enter-active,
  .xh-star-prompt-leave-active {
    transition: opacity 0.24s;
  }

  .xh-star-prompt-enter-from,
  .xh-star-prompt-leave-to {
    transform: none;
  }
}
</style>
