<script setup lang="ts">
import type { XiHanThemeConfig } from "../config";
import { useData } from "vitepress";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { XIHAN_LABELS } from "../labels.js";

const { theme } = useData<XiHanThemeConfig>();

const root = ref<HTMLElement>();
const toggle = ref<HTMLButtonElement>();
// 浏览器支持元素全屏才出按钮；服务端渲染时先不出
const supported = ref(false);
const active = ref(false);

const label = computed(() => active.value
  ? theme.value.exitFullscreenLabel ?? XIHAN_LABELS.exitFullscreenLabel
  : theme.value.fullscreenLabel ?? XIHAN_LABELS.fullscreenLabel);

// 进出全屏都经 fullscreenchange 同步，Esc 退出也一样；退出后焦点回到按钮
function onFullscreenChange(): void {
  const wasActive = active.value;
  active.value = document.fullscreenElement === root.value;
  if (wasActive && !active.value)
    toggle.value?.focus();
}

async function onToggle(): Promise<void> {
  if (document.fullscreenElement === root.value)
    await document.exitFullscreen();
  else
    await root.value?.requestFullscreen();
}

onMounted(() => {
  supported.value = document.fullscreenEnabled;
  document.addEventListener("fullscreenchange", onFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  if (document.fullscreenElement === root.value)
    void document.exitFullscreen();
});
</script>

<template>
  <div ref="root" class="xh-fullscreen" :data-fullscreen="active ? '' : undefined">
    <div v-if="supported" class="xh-fullscreen__bar">
      <button ref="toggle" class="xh-fullscreen__toggle" type="button" @click="onToggle">
        <svg class="xh-fullscreen__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path v-if="active" d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
          <path v-else d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
        </svg>
        {{ label }}
      </button>
    </div>
    <div class="xh-fullscreen__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.xh-fullscreen__bar {
  display: flex;
  justify-content: flex-end;
  margin-block-end: 8px;
}

.xh-fullscreen__toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 26px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.xh-fullscreen__toggle:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.xh-fullscreen__toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.xh-fullscreen__icon {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 全屏时铺满视口，正文是一列弹性盒，站点让要长高的内容 flex: 1 */
.xh-fullscreen[data-fullscreen] {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px 24px;
  overflow: auto;
  background: var(--vp-c-bg);
}

.xh-fullscreen[data-fullscreen] > .xh-fullscreen__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}
</style>
