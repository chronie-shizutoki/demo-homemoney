import axios from 'axios';

// 使用本地存储的BrowserDB替代后端API
import browserDB from '../utils/browserDB';

export const ExpenseAPI = {
  async addExpensesBatch (records) {
    try {
      console.log('[Expense API] 批量添加消费记录到本地存储');
      const result = await browserDB.addExpensesBatch(records);
      return {
        data: result,
        status: 200,
        statusText: 'OK'
      };
    } catch (error) {
      console.error('批量添加消费记录失败:', error);
      throw error;
    }
  },

  async getExpenses (page = 1, limit = 1000000) {
    console.log('[Expense API] 从本地存储获取消费数据');
    try {
      const expenses = await browserDB.getExpenses(page, limit);
      // 模拟API响应格式
      return {
        data: expenses
      };
    } catch (error) {
      console.error('获取消费数据失败:', error);
      throw error;
    }
  },

  async addExpense (data) {
    try {
      console.log('[Expense API] 添加消费记录到本地存储');
      const result = await browserDB.addExpense(data);
      return {
        data: result,
        status: 200,
        statusText: 'OK'
      };
    } catch (error) {
      console.error('添加消费数据失败:', error);
      throw error;
    }
  },

  async getStatistics () {
    try {
      console.log('[Expense API] 从本地存储获取统计数据');
      const statistics = await browserDB.getExpenseStatistics();
      return statistics;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return { error: error.message };
    }
  }
};
