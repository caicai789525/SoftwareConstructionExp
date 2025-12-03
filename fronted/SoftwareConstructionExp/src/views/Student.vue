<script setup>
import { ref, onMounted } from 'vue'
import { api, uploadDocument } from '../api'
import FilterBar from '../components/FilterBar.vue'
const userId = Number(sessionStorage.getItem('user_id')||0)
const matches = ref([])
const myApps = ref([])
const projects = ref([])
const selectedProject = ref('')
const applyMsg = ref('')
const error = ref('')
const uploadError = ref('')
const docs = ref([])
const uploadAppId = ref('')
const uploadFile = ref(null)

async function loadData() {
  try {
    const [ms, ps, apps] = await Promise.all([
      api.matches(userId),
      api.listProjects(''),
      api.listMyApplications('')
    ])
    matches.value = ms
    projects.value = ps
    myApps.value = apps
  } catch(e) { error.value = e.message }
}

const matchQuery = ref('')
function filteredMatches() {
  if (!matchQuery.value) return matches.value
  const q = matchQuery.value.toLowerCase()
  return matches.value.filter(m => (m.project.title||'').toLowerCase().includes(q) || (m.reason||'').toLowerCase().includes(q))
}

async function onApply() {
  try {
    const pid = Number(selectedProject.value)
    if (!pid) return
    await api.apply({ student_id: userId, project_id: pid })
    applyMsg.value = '已提交申请'
    await loadData()
  } catch(e) { error.value = e.message }
}

async function loadDocs() {
  try {
    if (!uploadAppId.value) return
    docs.value = await api.listDocuments(Number(uploadAppId.value))
  } catch(e) { uploadError.value = e.message }
}

async function onUpload() {
  uploadError.value=''
  try {
    if (!uploadAppId.value || !uploadFile.value?.files?.[0]) return
    await uploadDocument(Number(uploadAppId.value), uploadFile.value.files[0])
    await loadDocs()
  } catch(e) { uploadError.value = e.message }
}

onMounted(loadData)
</script>

<template>
  <h2>学生端</h2>
  <div class="grid grid-2">
    <section class="card">
      <h3>个性化匹配</h3>
      <div class="toolbar">
        <FilterBar placeholder="搜索项目或理由" @update:query="v=>matchQuery=v" />
        <button class="btn" @click="loadData">刷新</button>
      </div>
      <div v-if="filteredMatches().length===0">暂无匹配</div>
      <ul class="list">
        <li v-for="m in filteredMatches()" :key="m.project.id">
          <b>{{ m.project.title }}</b> | 匹配度: {{ (m.score*100).toFixed(0) }}% | {{ m.reason }}
        </li>
      </ul>
    </section>

    <section class="card">
      <h3>申请项目</h3>
      <div class="toolbar">
        <select v-model="selectedProject">
          <option value="">选择项目</option>
          <option v-for="p in projects" :value="p.id">{{ p.title }}</option>
        </select>
        <button class="btn" @click="onApply">申请</button>
        <button class="btn secondary" @click="loadData">刷新</button>
        <span style="margin-left:8px;color:#4a4">{{ applyMsg }}</span>
      </div>
    </section>
  </div>

  <div class="grid grid-2">
    <section class="card">
      <h3>我的申请</h3>
      <ul class="list">
        <li v-for="v in myApps" :key="v.application.id">
          <b>{{ v.project.title }}</b> | 状态: {{ v.application.status }} | 匹配度: {{ (v.score*100).toFixed(0) }}%
        </li>
      </ul>
    </section>

    <section class="card">
      <h3>成果文档上传</h3>
      <div class="toolbar">
        <label>申请ID<input v-model="uploadAppId" /></label>
        <input type="file" ref="uploadFile" />
        <button class="btn" @click="onUpload">上传</button>
        <button class="btn secondary" @click="loadDocs">刷新列表</button>
      </div>
      <div class="error" v-if="uploadError">{{ uploadError }}</div>
      <ul class="list">
        <li v-for="d in docs" :key="d.id">{{ d.name }} ({{ d.path }})</li>
      </ul>
    </section>
  </div>

  <div class="error" v-if="error">{{ error }}</div>
</template>

<style scoped>
section { margin:0 }
.error { color:#d33; margin-top:8px }
</style>
