<script setup>
import { ref, onMounted } from "vue";
import { api } from "../api";
import FilterBar from "../components/FilterBar.vue";
const userId = Number(sessionStorage.getItem("user_id") || 0);
const apps = ref([]);
const appStatus = ref("submitted");
const error = ref("");
const projects = ref([]);
const projectId = ref("");
const busyId = ref(0);
const msgs = ref({});
async function load() {
  try {
    const [ps, av] = await Promise.all([
      api.listProjects(String(userId)),
      api.listApplications(`status=${appStatus.value || "submitted"}&fast=1`),
    ]);
    projects.value = ps;
    apps.value = av;
  } catch (e) {
    error.value = e.message;
  }
}
function filtered() {
  const owned = apps.value.filter(
    (v) => v.project && Number(v.project.teacher_id) === userId
  );
  if (!projectId.value) return owned;
  const pid = Number(projectId.value);
  return owned.filter((v) => v.project && Number(v.project.id) === pid);
}
async function updateStatus(appId, status) {
  try {
    busyId.value = appId;
    const res = await api.updateApplicationStatus(appId, status);
    msgs.value[appId] = "已更新";
    await load();
  } catch (e) {
    msgs.value[appId] = e.message || "更新失败";
    error.value = e.message;
  } finally {
    busyId.value = 0;
  }
}
onMounted(load);
</script>

<template>
  <section class="card">
    <h3>学生申请</h3>
    <div class="toolbar">
      <span style="margin-right: 8px">筛选</span>
      <FilterBar
        :options="[
          { value: 'submitted', label: 'submitted' },
          { value: 'approved', label: 'approved' },
          { value: 'rejected', label: 'rejected' },
        ]"
        @update:option="
          (v) => {
            appStatus = v;
            load();
          }
        "
      />
      <select v-model="projectId">
        <option value="">全部项目</option>
        <option v-for="p in projects" :key="p.id" :value="p.id">
          {{ p.title }}
        </option>
      </select>
      <button class="btn secondary" @click="load">刷新</button>
    </div>
    <ul class="list">
      <li v-for="v in filtered()" :key="v.application.id">
        申请ID {{ v.application.id }} | 学生 {{ v.student.name }} | 项目
        {{ v.project.title }} | 匹配度 {{ (v.score * 100).toFixed(0) }}%
        <div class="toolbar" style="margin-top: 6px">
          <button
            class="btn"
            :disabled="busyId === v.application.id"
            @click="updateStatus(v.application.id, 'approved')"
          >
            通过
          </button>
          <button
            class="btn secondary"
            :disabled="busyId === v.application.id"
            @click="updateStatus(v.application.id, 'rejected')"
          >
            拒绝
          </button>
          <span
            style="margin-left: 8px; color: #4a4"
            v-if="msgs[v.application.id]"
            >{{ msgs[v.application.id] }}</span
          >
        </div>
      </li>
    </ul>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error {
  color: #d33;
  margin-top: 8px;
}
</style>
