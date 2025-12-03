<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
const me = ref(null)
const name = ref('')
const email = ref('')
const skillsText = ref('')
const msg = ref('')
const error = ref('')
async function load() {
  try { const u = await api.me(); me.value = u; name.value = u.name||''; email.value = u.email||''; skillsText.value = (u.skills||[]).join(', ') } catch(e){ error.value=e.message }
}
async function save() {
  error.value=''; msg.value=''
  if (!name.value || !email.value) { error.value='姓名与邮箱不能为空'; return }
  try {
    const skills = skillsText.value.split(',').map(s=>s.trim()).filter(Boolean)
    await api.updateMe({ name: name.value, email: email.value, skills })
    msg.value='已保存'
    await load()
  } catch(e){ error.value=e.message }
}
onMounted(load)
</script>

<template>
  <section class="card">
    <h3>个人信息</h3>
    <div class="toolbar">
      <button class="btn" @click="save">保存</button>
      <span style="color:#4a4">{{ msg }}</span>
    </div>
    <div class="form-grid">
      <div class="field"><label>姓名</label><input v-model="name" /></div>
      <div class="field"><label>邮箱</label><input v-model="email" type="email" /></div>
      <div class="field span-2"><label>技能(逗号分隔)</label><input v-model="skillsText" placeholder="如: python, nlp" /></div>
    </div>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.form-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px }
.form-grid .span-2 { grid-column: span 2 }
@media (max-width: 900px) { .form-grid { grid-template-columns: 1fr } .form-grid .span-2 { grid-column: span 1 } }
.field label { display:block; margin-bottom:6px; font-weight:600 }
.error { color:#d33; margin-top:8px }
</style>
