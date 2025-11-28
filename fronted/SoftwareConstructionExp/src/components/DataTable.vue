<script setup>
const props = defineProps({ columns: Array, rows: Array })
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th v-for="c in props.columns" :key="c.key">{{ c.title }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in props.rows" :key="r.id||JSON.stringify(r)">
        <td v-for="c in props.columns" :key="c.key">
          <slot :name="c.key" :row="r">{{ r[c.key] }}</slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.table { width:100%; border-collapse: collapse }
th, td { text-align:left; padding:10px; border-bottom:1px solid #eee }
</style>
