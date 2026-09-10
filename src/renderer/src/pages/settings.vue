<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import Header from "@/components/Header.vue";
import type { AppInfo } from "@shared/app-api";

const router = useRouter();
const route = useRoute();
const appInfo = ref<AppInfo>();
const errorReportingEnabled = ref(false);
const loading = ref(true);
const saving = ref(false);
const loadError = ref("");
const actionError = ref("");
const status = ref("");
let settingsRevision = 0;

const unsubscribe = window.kemosikaApi.onAppSettingsChanged((settings) => {
  settingsRevision += 1;
  errorReportingEnabled.value = settings.errorReportingEnabled;
});
onUnmounted(unsubscribe);

const loadSettings = async () => {
  loading.value = true;
  loadError.value = "";
  const revision = settingsRevision;
  try {
    const [info, settings] = await Promise.all([
      window.kemosikaApi.getAppInfo(),
      window.kemosikaApi.getAppSettings(),
    ]);
    appInfo.value = info;
    if (revision === settingsRevision) {
      errorReportingEnabled.value = settings.errorReportingEnabled;
    }
  } catch {
    loadError.value = "設定を読み込めませんでした。再読み込みしてください。";
  } finally {
    loading.value = false;
  }
};

const updateErrorReporting = async (value: string | number | boolean) => {
  if (
    saving.value ||
    loading.value ||
    loadError.value ||
    typeof value !== "boolean"
  )
    return;
  const previous = errorReportingEnabled.value;
  errorReportingEnabled.value = value;
  saving.value = true;
  actionError.value = "";
  status.value = "保存中…";
  try {
    const settings = await window.kemosikaApi.setErrorReportingEnabled(value);
    errorReportingEnabled.value = settings.errorReportingEnabled;
    status.value = "設定を保存しました。";
  } catch {
    errorReportingEnabled.value = previous;
    status.value = "";
    actionError.value =
      "設定を保存できませんでした。もう一度切り替えてください。";
  } finally {
    saving.value = false;
  }
};

const closeSettings = () => {
  const layoutId =
    typeof route.query.layoutId === "string" ? route.query.layoutId : undefined;
  void router.replace({ name: "Index", query: { layoutId } });
};

const openRepository = async () => {
  actionError.value = "";
  try {
    await window.kemosikaApi.openRepository();
  } catch {
    actionError.value =
      "リポジトリを開けませんでした。もう一度リンクを押してください。";
  }
};

onMounted(loadSettings);
</script>

<template>
  <div class="settings-page">
    <div class="titlebar"><Header :show-home="false" /></div>
    <main class="content" aria-labelledby="settings-title">
      <div class="heading">
        <h1 id="settings-title">設定</h1>
        <div class="close-action">
          <ElButton
            class="nn-button close-button"
            aria-label="設定を閉じてレイアウト一覧に戻る"
            data-testid="settings-close-button"
            @click="closeSettings"
          >
            <Icon icon="mingcute:close-line" aria-hidden="true" />
          </ElButton>
          <span aria-hidden="true">一覧に戻る</span>
        </div>
      </div>

      <div v-if="loadError" class="load-error" role="alert">
        <p>{{ loadError }}</p>
        <ElButton class="nn-button" @click="loadSettings">再読み込み</ElButton>
      </div>

      <div class="sections" :aria-busy="loading">
        <section class="panel" aria-labelledby="about-title">
          <h2 id="about-title">アプリについて</h2>
          <dl class="details">
            <div class="detail-row">
              <dt>バージョン</dt>
              <dd data-testid="app-version">{{ appInfo?.version ?? "—" }}</dd>
            </div>
            <div class="detail-row">
              <dt>リポジトリ</dt>
              <dd>
                <a
                  v-if="appInfo"
                  class="repository-link"
                  :href="appInfo.repositoryUrl"
                  aria-label="nekobato/KeMoSika（ブラウザーで開く）"
                  @click.prevent="openRepository"
                >
                  <span>nekobato/KeMoSika</span>
                  <Icon icon="mingcute:external-link-line" aria-hidden="true" />
                </a>
                <span v-else>—</span>
              </dd>
            </div>
          </dl>
        </section>

        <section class="panel" aria-labelledby="report-title">
          <h2 id="report-title">エラー報告</h2>
          <ElCheckbox
            class="report-checkbox"
            :model-value="errorReportingEnabled"
            :disabled="loading || saving || !!loadError"
            aria-describedby="report-description"
            data-testid="error-reporting-checkbox"
            @change="updateErrorReporting"
            >不具合の報告に協力する</ElCheckbox
          >
          <p id="report-description" class="description">
            アプリでエラーが発生した際に、調査・改善のための情報を送信します。<br />
            初期設定はOFFです。
          </p>
        </section>
        <p class="status" role="status">
          {{ loading ? "読み込み中…" : status }}
        </p>
        <p v-if="actionError" class="error" role="alert">{{ actionError }}</p>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.settings-page {
  height: 100%;
  display: grid;
  grid-template-rows: 40px minmax(0, 1fr);
  color: var(--color-text-body);
  background: #242629;
}
.titlebar {
  border-bottom: 1px solid var(--color-white-t50);
}
.content {
  overflow: auto;
  padding: 32px 40px 40px;
}
.heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
  h1 {
    margin: 8px 0 0;
    font-size: 28px;
    line-height: 1.4;
  }
}
.close-action {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  color: var(--color-grey-200);
  font-size: 12px;
}
.close-button {
  color: var(--color-text-body);
  background: transparent;
  width: 56px;
  height: 56px;
  padding: 0;
  margin: 0;
  border: 1px solid var(--color-grey-300);
  border-radius: 8px;
  svg {
    width: 28px;
    height: 28px;
  }
  &:hover {
    background: var(--color-white-t50);
  }
}
.sections {
  max-width: 760px;
  margin: 0 auto;
}
.panel {
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--color-white-t100);
  border-radius: 8px;
  h2 {
    margin: 0 0 16px;
    font-size: 18px;
    line-height: 1.5;
  }
}
.details {
  margin: 0;
}
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 24px;
  min-height: 56px;
  border-top: 1px solid var(--color-white-t100);
  font-size: 15px;
  dd {
    margin: 0;
    color: var(--color-grey-200);
  }
}
.repository-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  color: var(--color-teal-200);
  text-underline-offset: 3px;
  svg {
    width: 20px;
    height: 20px;
  }
  &:hover {
    color: var(--color-teal-100);
  }
}
.report-checkbox {
  min-height: 44px;
  height: auto;
  margin-right: 0;
  --el-checkbox-text-color: var(--color-text-body);
  --el-checkbox-checked-text-color: var(--color-text-body);
  --el-checkbox-checked-bg-color: var(--color-teal-400);
  --el-checkbox-checked-input-border-color: var(--color-teal-400);
  --el-checkbox-input-width: 20px;
  --el-checkbox-input-height: 20px;
  --el-checkbox-bg-color: transparent;
  :deep(.el-checkbox__label) {
    font-size: 16px;
    white-space: normal;
    line-height: 1.5;
  }
  :deep(.el-checkbox__inner::after) {
    left: 6px;
    top: 3px;
  }
}
.description {
  margin: 4px 0 0 28px;
  color: var(--color-grey-200);
  font-size: 14px;
  line-height: 1.8;
}
.status {
  min-height: 24px;
  margin: 0;
  color: var(--color-grey-200);
  font-size: 13px;
}
.error,
.load-error {
  color: var(--color-red-200);
  font-size: 14px;
}
.close-button:focus-visible,
.repository-link:focus-visible {
  outline: 2px solid var(--color-teal-200);
  outline-offset: 4px;
}
@media (max-width: 640px) {
  .content {
    padding: 24px 20px;
  }
  .panel {
    padding: 20px;
  }
}
</style>
