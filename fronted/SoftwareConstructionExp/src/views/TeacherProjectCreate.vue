<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
const router = useRouter()
const userId = Number(sessionStorage.getItem('user_id')||0)
const title = ref('')
const desc = ref('')
const reqInput = ref('')
const tagInput = ref('')
const requirements = ref([])
const tags = ref([])
const msg = ref('')
const error = ref('')
function addReq(){ const v = reqInput.value.trim(); if(!v) return; requirements.value = [...requirements.value, v]; reqInput.value='' }
function removeReq(i){ requirements.value = requirements.value.filter((_,idx)=>idx!==i) }
function addTag(){ const v = tagInput.value.trim(); if(!v) return; tags.value = [...tags.value, v]; tagInput.value='' }
function removeTag(i){ tags.value = tags.value.filter((_,idx)=>idx!==i) }
function validate(){ if(!title.value || !desc.value || requirements.value.length===0) return '请完善标题、描述与至少一个项目要求'; return '' }
async function submit() {
  try {
    const v = validate(); if(v){ error.value=v; return }
    const p = { teacher_id: userId, title: title.value, description: desc.value, requirements: requirements.value, tags: tags.value }
    await api.createProject(p)
    msg.value = '项目已创建'
    setTimeout(()=>router.push('/teacher/projects'), 800)
  } catch(e) { error.value = e.message }
}
</script>

<template>
  <section class="card">
    <div class="toolbar">
      <button class="btn large" @click="submit">发布项目</button>
      <span style="color:#4a4">{{ msg }}</span>
    </div>
    <div class="form-grid">
      <div class="field">
        <label>项目标题</label>
        <input v-model="title" placeholder="请输入项目标题" />
        <small class="hint">简洁明确，突出研究主题</small>
      </div>
      <div class="field span-2">
        <label>项目描述</label>
        <textarea v-model="desc" rows="5" placeholder="补充研究背景、目标与内容" />
      </div>
      <div class="field span-2">
        <label>项目要求</label>
        <div class="inline">
          <input v-model="reqInput" placeholder="如: python, nlp" />
          <button class="btn" @click="addReq">添加</button>
        </div>
        <div class="chips">
          <span v-for="(r,i) in requirements" :key="i" class="chip" @click="removeReq(i)">{{ r }} ×</span>
        </div>
      </div>
      <div class="field span-2">
        <label>项目标签</label>
        <div class="inline">
          <input v-model="tagInput" placeholder="如: 计算机视觉" />
          <button class="btn secondary" @click="addTag">添加</button>
        </div>
        <div class="chips">
          <span v-for="(t,i) in tags" :key="i" class="chip" @click="removeTag(i)">{{ t }} ×</span>
        </div>
      </div>
    </div>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.form-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px }
.form-grid .span-2 { grid-column: span 2 }
@media (max-width: 900px) { .form-grid { grid-template-columns: 1fr } .form-grid .span-2 { grid-column: span 1 } }
.field label { display:block; margin-bottom:6px; font-weight:600 }
.hint { color:#888 }
.inline { display:flex; gap:8px }
.chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px }
.chip { padding:6px 10px; border:1px solid #eee; border-radius:999px; background:#fff; cursor:pointer }
@media (prefers-color-scheme: dark) { .chip { background:#1a1a1a; border-color:#333 } }
.btn.large { padding: 10px 18px; font-size: 1.05em }
.error { color:#d33; margin-top:8px }
</style>
