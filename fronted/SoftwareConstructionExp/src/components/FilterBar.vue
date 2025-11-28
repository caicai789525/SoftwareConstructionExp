<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ placeholder: { type: String, default: '搜索' }, options: { type: Array, default: () => [] } })
const emits = defineEmits(['update:query','update:option'])
const q = ref('')
const opt = ref('')
watch(q, v => emits('update:query', v))
watch(opt, v => emits('update:option', v))
</script>

<template>
  <div class="filterbar">
    <input :placeholder="props.placeholder" v-model="q" />
    <select v-model="opt">
      <option value="">全部</option>
      <option v-for="o in props.options" :value="o.value">{{ o.label }}</option>
    </select>
  </div>
  
</template>

<style scoped>
.filterbar { display:flex; gap:8px; align-items:center }
input, select { flex:1 }
</style>
