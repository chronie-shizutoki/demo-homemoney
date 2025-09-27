import browserDB from '../utils/browserDB';

/**
 * 消费记录API - 基于浏览器数据库
 */
export const ExpenseAPI = {
  /**
   * 批量添加消费记录
   */
  async addExpensesBatch (records) {
    try {
      console.log('BrowserDB: 批量添加消费记录');
      return await browserDB.addExpensesBatch(records);
    } catch (error) {
      console.error('BrowserDB: 批量添加消费记录失败:', error);
      throw error;
    }
  },

  /**
   * 获取消费记录
   */
  async getExpenses (page = 1, limit = 1000000) {
    try {
      console.log('BrowserDB: 获取消费数据');
      const expenses = await browserDB.getExpenses(page, limit);
      return expenses;
    } catch (error) {
      console.error('BrowserDB: 获取消费数据失败:', error);
      throw error;
    }
  },

  /**
   * 添加单条消费记录
   */
  async addExpense (data) {
    try {
      console.log('BrowserDB: 添加消费记录');
      return await browserDB.addExpense(data);
    } catch (error) {
      console.error('BrowserDB: 添加消费数据失败:', error);
      throw error;
    }
  },

  /**
   * 获取消费统计数据
   */
  async getStatistics () {
    try {
      console.log('BrowserDB: 获取统计数据');
      return await browserDB.getExpenseStatistics();
    } catch (error) {
      console.error('BrowserDB: 获取统计数据失败:', error);
      return { error: error.message };
    }
  }
};

// 保持API_BASE变量以便向后兼容
export const API_BASE = '/api';
