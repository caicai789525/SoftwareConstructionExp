<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const role = localStorage.getItem('role')
function to(p){ router.push(p) }
</script>

<template>
  <aside v-if="role==='student' || role==='teacher' || role==='admin'" class="sidebar">
    <div class="section" v-if="role==='student'">
      <div class="title">学生</div>
      <a :class="{active: route.path==='/student/match'}" href="#" @click.prevent="to('/student/match')">个性化匹配</a>
      <a :class="{active: route.path==='/student/apply'}" href="#" @click.prevent="to('/student/apply')">一键申请</a>
      <a :class="{active: route.path==='/student/applications'}" href="#" @click.prevent="to('/student/applications')">我的申请</a>
      <a :class="{active: route.path==='/student/docs'}" href="#" @click.prevent="to('/student/docs')">成果文档</a>
    </div>
    <div class="section" v-if="role==='teacher'">
      <div class="title">教师</div>
      <a :class="{active: route.path==='/teacher/projects'}" href="#" @click.prevent="to('/teacher/projects')">项目管理</a>
      <a :class="{active: route.path==='/teacher/tracking'}" href="#" @click.prevent="to('/teacher/tracking')">过程跟踪</a>
      <a :class="{active: route.path==='/teacher/applications'}" href="#" @click.prevent="to('/teacher/applications')">申请筛选</a>
    </div>
    <div class="section" v-if="role==='admin'">
      <div class="title">管理员</div>
      <a :class="{active: route.path==='/admin/stats'}" href="#" @click.prevent="to('/admin/stats')">数据看板</a>
      <a :class="{active: route.path==='/admin/users'}" href="#" @click.prevent="to('/admin/users')">用户列表</a>
      <a :class="{active: route.path==='/admin/role'}" href="#" @click.prevent="to('/admin/role')">角色管理</a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar { width: 240px; flex-shrink: 0; border-right: 1px solid #eee; padding: 12px }
.section { margin-bottom: 18px }
.title { font-weight: 600; margin-bottom: 8px }
a { display:block; padding:8px 6px; border-radius:8px }
a.active { background: rgba(100,108,255,0.12) }
</style>
