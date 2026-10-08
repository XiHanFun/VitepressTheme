<script setup lang="ts">
import type { XiHanAd } from "../composables/promotions";
import { computed, ref, watch } from "vue";
import { usePromotions } from "../composables/promotions";
import { DEFAULT_SPONSOR_LINK } from "../options";

const promotions = usePromotions();

const sponsorLink = computed(() => promotions.value?.sponsorLink || DEFAULT_SPONSOR_LINK);
const largeSponsors = computed(() => (promotions.value?.sponsors ?? []).filter(s => s.tier === "large"));
const smallSponsors = computed(() => (promotions.value?.sponsors ?? []).filter(s => s.tier !== "large"));
// 小号赞助是奇数个时，「成为赞助商」补在同一行；否则另起一整行
const joinFillsRow = computed(() => smallSponsors.value.length % 2 === 1);

// 每次页面加载随机挑一条广告，关掉后本次浏览不再显示
const ad = ref<XiHanAd | null>(null);
const adClosed = ref(false);
watch(promotions, (value) => {
  const ads = value?.ads ?? [];
  ad.value = ads.length > 0 ? ads[Math.floor(Math.random() * ads.length)] : null;
});
</script>

<template>
  <div v-if="promotions" class="xh-aside-promotions">
    <a class="xh-aside-promotions__label" :href="sponsorLink" target="_blank" rel="noreferrer">赞助位</a>
    <div class="vp-sponsor aside">
      <section v-if="largeSponsors.length" class="vp-sponsor-section">
        <div class="vp-sponsor-grid mini" data-vp-grid="1">
          <div v-for="sponsor in largeSponsors" :key="sponsor.name" class="vp-sponsor-grid-item">
            <a class="vp-sponsor-grid-link" :href="sponsor.url" target="_blank" rel="sponsored noopener">
              <article class="vp-sponsor-grid-box">
                <img v-if="sponsor.img" class="vp-sponsor-grid-image xh-aside-promotions__image" :src="sponsor.img" :alt="sponsor.name">
                <span v-else class="xh-aside-promotions__name">{{ sponsor.name }}</span>
              </article>
            </a>
          </div>
        </div>
      </section>

      <section v-if="smallSponsors.length" class="vp-sponsor-section">
        <div class="vp-sponsor-grid xmini" data-vp-grid="2">
          <div v-for="sponsor in smallSponsors" :key="sponsor.name" class="vp-sponsor-grid-item">
            <a class="vp-sponsor-grid-link" :href="sponsor.url" target="_blank" rel="sponsored noopener">
              <article class="vp-sponsor-grid-box">
                <img v-if="sponsor.img" class="vp-sponsor-grid-image xh-aside-promotions__image" :src="sponsor.img" :alt="sponsor.name">
                <span v-else class="xh-aside-promotions__name">{{ sponsor.name }}</span>
              </article>
            </a>
          </div>
          <div v-if="joinFillsRow" class="vp-sponsor-grid-item">
            <a class="vp-sponsor-grid-link" :href="sponsorLink" target="_blank" rel="noreferrer">
              <article class="vp-sponsor-grid-box">
                <span class="xh-aside-promotions__name">成为赞助商</span>
              </article>
            </a>
          </div>
        </div>
      </section>

      <section v-if="!joinFillsRow" class="vp-sponsor-section">
        <div class="vp-sponsor-grid xmini" data-vp-grid="1">
          <div class="vp-sponsor-grid-item">
            <a class="vp-sponsor-grid-link" :href="sponsorLink" target="_blank" rel="noreferrer">
              <article class="vp-sponsor-grid-box">
                <span class="xh-aside-promotions__name">成为赞助商</span>
              </article>
            </a>
          </div>
        </div>
      </section>
    </div>

    <div v-if="ad && !adClosed" class="xh-aside-ad">
      <a class="xh-aside-ad__link" :href="ad.url" target="_blank" rel="sponsored noopener">
        <img v-if="ad.img" class="xh-aside-ad__image" :src="ad.img" :alt="ad.name">
        <p class="xh-aside-ad__text">{{ ad.text || ad.name }}</p>
      </a>
      <div class="xh-aside-ad__footer">
        <span class="xh-aside-ad__tag">广告</span>
        <button class="xh-aside-ad__close" type="button" aria-label="关闭广告" @click="adClosed = true">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xh-aside-promotions {
  margin-top: 32px;
}

.xh-aside-promotions__label {
  display: block;
  margin-bottom: 12px;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.25s;
}

.xh-aside-promotions__label:hover {
  color: var(--vp-c-text-2);
}

.xh-aside-promotions__image.xh-aside-promotions__image {
  max-width: 120px;
  max-height: 72px;
  filter: none;
}

.xh-aside-promotions__name {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.xh-aside-ad {
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
}

.xh-aside-ad__link {
  display: block;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.xh-aside-ad__image {
  display: block;
  width: 100%;
  border-radius: 6px;
}

.xh-aside-ad__text {
  margin: 10px 0 0;
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
  line-height: 22px;
}

.xh-aside-ad__link:hover .xh-aside-ad__text {
  color: var(--vp-c-brand-1);
}

.xh-aside-ad__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.xh-aside-ad__tag {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.xh-aside-ad__close {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  color: var(--vp-c-text-3);
  background: transparent;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.xh-aside-ad__close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.xh-aside-ad__close svg {
  width: 12px;
  height: 12px;
  fill: currentColor;
}
</style>
