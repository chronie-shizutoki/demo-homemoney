import { ExpenseAPI } from './expenses';
import { DebtAPI } from './debts';

// 由于现在使用本地存储，不再需要axios实例
// 创建一个模拟的API对象，以保持向后兼容性
export default {
  get: async (url, options = {}) => {
    console.log('[Mock API] 模拟GET请求:', url, options);
    return { data: [], status: 200 };
  },
  post: async (url, data = {}, options = {}) => {
    console.log('[Mock API] 模拟POST请求:', url, data, options);
    return { data: {}, status: 200 };
  },
  put: async (url, data = {}, options = {}) => {
    console.log('[Mock API] 模拟PUT请求:', url, data, options);
    return { data: {}, status: 200 };
  },
  delete: async (url, options = {}) => {
    console.log('[Mock API] 模拟DELETE请求:', url, options);
    return { data: {}, status: 200 };
  }
};

export { ExpenseAPI, DebtAPI };
