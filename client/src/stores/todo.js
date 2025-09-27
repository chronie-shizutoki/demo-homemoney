import { defineStore } from 'pinia';
import browserDB from '../utils/browserDB';

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: []
  }),

  getters: {
    completedTodos: (state) => state.todos.filter(todo => todo.completed),
    pendingTodos: (state) => state.todos.filter(todo => !todo.completed),
    totalTodos: (state) => state.todos.length,
    completedCount: (state) => state.todos.filter(todo => todo.completed).length
  },

  actions: {
    // 添加新的待办事项
    addTodo (text) {
      if (!text.trim()) return;

      const newTodo = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      this.todos.unshift(newTodo);
      this.saveTodos();
    },

    // 切换待办事项完成状态
    toggleTodo (id) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
        this.saveTodos();
      }
    },

    // 删除待办事项
    deleteTodo (id) {
      const index = this.todos.findIndex(t => t.id === id);
      if (index > -1) {
        this.todos.splice(index, 1);
        this.saveTodos();
      }
    },

    // 编辑待办事项文本
    editTodo (id, newText) {
      const todo = this.todos.find(t => t.id === id);
      if (todo && newText.trim()) {
        todo.text = newText.trim();
        todo.updatedAt = new Date().toISOString();
        this.saveTodos();
      }
    },

    // 清除所有已完成的待办事项
    clearCompleted () {
      this.todos = this.todos.filter(todo => !todo.completed);
      this.saveTodos();
    },

    // 保存到浏览器数据库
    async saveTodos () {
      try {
        // 先保存到浏览器数据库
        await browserDB.saveTodos(this.todos);
        
        // 同时保存到localStorage作为备份
        localStorage.setItem('homemoney-todos', JSON.stringify(this.todos));
        
        console.log('Todos saved to browser database successfully');
      } catch (error) {
        console.error('Failed to save todos:', error);
      }
    },

    // 从浏览器数据库加载
    async loadTodos () {
      try {
        // 尝试从浏览器数据库获取数据
        const dbTodos = await browserDB.getTodos();
        if (dbTodos && dbTodos.length > 0) {
          // 修正completed字段类型
          this.todos = dbTodos.map(todo => ({
            ...todo,
            completed: todo.completed === true || todo.completed === 'true'
          }));
          console.log('Todos loaded from browser database successfully');
        } else {
          // 数据库为空，尝试从localStorage加载
          const saved = localStorage.getItem('homemoney-todos');
          if (saved) {
            const localTodos = JSON.parse(saved);
            this.todos = (Array.isArray(localTodos) ? localTodos : []).map(todo => ({
              ...todo,
              completed: todo.completed === true || todo.completed === 'true'
            }));
            
            // 如果从localStorage加载到数据，保存到数据库
            if (this.todos.length > 0) {
              await browserDB.saveTodos(this.todos);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load todos from browser database:', error);
        // 加载失败，尝试从localStorage加载
        const saved = localStorage.getItem('homemoney-todos');
        if (saved) {
          const localTodos = JSON.parse(saved);
          this.todos = (Array.isArray(localTodos) ? localTodos : []).map(todo => ({
            ...todo,
            completed: todo.completed === true || todo.completed === 'true'
          }));
        }
      }
    }
  }
});
