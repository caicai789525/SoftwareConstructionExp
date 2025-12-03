<template>
  <section class="card">
    <div class="toolbar">
      <button class="btn secondary" @click="router.push('/teacher/projects')">
        返回项目管理
      </button>
    </div>
    <div v-if="project">
      <h2>{{ project.title }}</h2>
      <p v-if="teacher" class="muted">
        发布者：{{ teacher.name }}（{{ teacher.email }}）
      </p>
      <p style="white-space: pre-wrap">{{ project.description }}</p>
      <h3>项目要求</h3>
      <ul class="list">
        <li v-for="(r, i) in project.requirements" :key="i">{{ r }}</li>
      </ul>
      <h3>标签</h3>
      <div class="chips">
        <span v-for="(t, i) in project.tags" :key="i" class="chip">{{
          t
        }}</span>
      </div>
      <h3>已通过学生</h3>
      <ul class="list">
        <li v-if="approved.length === 0">暂无</li>
        <li v-for="s in approved" :key="s.id">{{ s.name }}（{{ s.email }}）</li>
      </ul>
    </div>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api";
const route = useRoute();
const router = useRouter();
const userId = Number(sessionStorage.getItem("user_id") || 0);
const project = ref(null);
const teacher = ref(null);
const approved = ref([]);
const error = ref("");
async function load() {
  try {
    const list = await api.listProjects(String(userId));
    project.value = list.find((p) => String(p.id) === route.params.id);
    if (!project.value) error.value = "未找到该项目";
    else {
      try {
        teacher.value = await api.getUser(project.value.teacher_id);
      } catch (e) {
        teacher.value = null;
      }
      try {
        const views = await api.listApplications("status=approved&fast=1");
        approved.value = views
          .filter(
            (v) =>
              v.project && String(v.project.id) === String(project.value.id)
          )
          .map((v) => v.student || {})
          .filter((s) => s && s.id);
      } catch (e) {
        approved.value = [];
      }
    }
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(load);
</script>

<style scoped>
.error {
  color: #d33;
  margin-top: 8px;
}
.muted {
  color: #666;
}
</style>
