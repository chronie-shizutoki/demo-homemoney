<template>
  <div class="todo-view">
    <TodoList />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
const TodoList = defineAsyncComponent(() => import('../components/TodoList.vue'));
</script>

<style scoped>
.todo-view {
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .todo-view {
    padding: 16px 0;
  }
}
</style>
