<script setup lang="ts">
import type { XiHanBanner } from "../config";
import { useData } from "vitepress";
import { computed } from "vue";
import { storage } from "../composables/promotions";

const DISMISSED_KEY = "xh-docs-banner-dismissed";

const { theme } = useData<{ banner?: XiHanBanner | null }>();
const banner = computed(() => theme.value.banner ?? null);

// 是否显示由 head 脚本在 html 上加的 xh-banner-open 决定，关闭时去掉它并记下这条公告
function dismiss(): void {
  if (!banner.value)
    return;
  storage.set(DISMISSED_KEY, banner.value.id);
  document.documentElement.classList.remove("xh-banner-open");
}
</script>

<template>
  <div v-if="banner" class="xh-banner" role="region" aria-label="公告">
    <div class="xh-banner__content">
      <p class="xh-banner__text">
        {{ banner.text }}
      </p>
      <a
        v-if="banner.link"
        class="xh-banner__action"
        :href="banner.link"
        target="_blank"
        rel="noreferrer"
      >
        {{ banner.linkText || "了解详情" }}
        <span class="vpi-arrow-right xh-banner__arrow" />
      </a>
    </div>
    <button class="xh-banner__close" type="button" aria-label="关闭公告" @click="dismiss">
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </button>
    <div class="xh-banner__glow xh-banner__glow--accent" />
    <div class="xh-banner__glow xh-banner__glow--brand" />
  </div>
</template>

<style>
.xh-banner {
  display: none;
}

html.xh-banner-open .xh-banner {
  display: flex;
}

html.xh-banner-open {
  --vp-layout-top-height: 64px;
}

@media (max-width: 768px) {
  html.xh-banner-open {
    --vp-layout-top-height: 56px;
  }
}

@media (max-width: 480px) {
  html.xh-banner-open {
    --vp-layout-top-height: 48px;
  }
}
</style>

<style scoped>
.xh-banner {
  position: fixed;
  z-index: 100;
  top: 0;
  right: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  height: var(--vp-layout-top-height, 64px);
  padding: 0 48px 0 12px;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--vp-c-white);
  background: #0f0f13;
  background-image: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.xh-banner__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.xh-banner__text {
  margin: 0;
  overflow: hidden;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xh-banner__action {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border-radius: 8px;
  color: var(--vp-c-white);
  background: linear-gradient(120deg, var(--xh-doc-accent) 0%, var(--xh-doc-brand-1) 100%);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.xh-banner__action:hover {
  color: var(--vp-c-white);
  opacity: 0.88;
}

.xh-banner__arrow {
  font-size: 14px;
}

.xh-banner__close {
  position: absolute;
  z-index: 1;
  top: 50%;
  right: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.72);
  background: transparent;
  cursor: pointer;
  transform: translateY(-50%);
  transition: color 0.2s, background-color 0.2s;
}

.xh-banner__close:hover {
  color: var(--vp-c-white);
  background: rgba(255, 255, 255, 0.1);
}

.xh-banner__close svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.xh-banner__glow {
  position: absolute;
  bottom: -15%;
  width: 80%;
  aspect-ratio: 1.5;
  border-radius: 100%;
  pointer-events: none;
  filter: blur(15vw);
}

.xh-banner__glow--accent {
  left: -75%;
  background: linear-gradient(270deg, var(--xh-doc-accent), var(--xh-doc-brand-2) 60% 80%, transparent);
  opacity: 0.6;
}

.xh-banner__glow--brand {
  right: -40%;
  background: linear-gradient(180deg, var(--xh-doc-brand-3), transparent);
  opacity: 0.3;
}

@media (max-width: 768px) {
  .xh-banner__text {
    font-size: 14px;
  }

  .xh-banner__action {
    padding: 4px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .xh-banner__content {
    gap: 8px;
  }

  .xh-banner__text {
    font-size: 13px;
  }
}
</style>
