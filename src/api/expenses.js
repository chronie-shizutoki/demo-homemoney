import offlineSync from '@/utils/offlineDataSync';

export const API_BASE = '/api'; // 保留这个常量以避免其他文件报错

export const ExpenseAPI = {
  async addExpensesBatch (records) {
    try {
      return await offlineSync.addExpensesBatch(records);
    } catch (error) {
      console.error('批量添加消费记录失败:', error);
      throw error;
    }
  },

  async getExpenses (page = 1, limit = 10, searchParams = {}) {
    console.log('[Expense API] 尝试获取消费数据（前端数据库）');
    try {
      // 处理URLSearchParams对象为普通对象
      let searchParamsObj = {};
      if (searchParams instanceof URLSearchParams) {
        searchParams.forEach((value, key) => {
          searchParamsObj[key] = value;
        });
      } else {
        searchParamsObj = searchParams;
      }
      
      console.log('[Expense API] 请求参数:', { page, limit, ...searchParamsObj });
      const result = await offlineSync.getExpenses(page, limit, searchParamsObj);
      
      // 模拟axios响应格式
      return {
        data: {
          data: result.data,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        },
        status: 200,
        statusText: 'OK'
      };
    } catch (error) {
      console.error('获取消费数据失败:', error);
      throw error;
    }
  },

  async addExpense (data) {
    try {
      // 转换数据格式
      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        date: data.date,
        remark: data.remark || ''
      };
      
      const result = await offlineSync.addExpense(expenseData);
      
      // 模拟axios响应格式
      return {
        data: result,
        status: 201,
        statusText: 'Created'
      };
    } catch (error) {
      console.error('添加消费数据失败:', error);
      throw error;
    }
  },

  async getStatistics (searchParams = {}) {
    try {
      // 处理URLSearchParams对象为普通对象
      let searchParamsObj = {};
      if (searchParams instanceof URLSearchParams) {
        searchParams.forEach((value, key) => {
          searchParamsObj[key] = value;
        });
      } else {
        searchParamsObj = searchParams;
      }
      
      console.log('[Expense API] 获取统计数据请求参数:', searchParamsObj);
      const result = await offlineSync.getExpenseStatistics(searchParamsObj);
      return result;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return { error: error.message || '未知错误' };
    }
  },

  // 更新消费记录
  async updateExpense (id, data) {
    try {
      console.log(`[Expense API] 更新消费记录 ID: ${id}`, data);
      
      // 转换数据格式
      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        date: data.date
      };
      
      const result = await offlineSync.updateExpense(id, expenseData);
      return result;
    } catch (error) {
      console.error(`更新消费记录失败 ID: ${id}:`, error);
      throw error;
    }
  },

  // 删除消费记录
  async deleteExpense (id) {
    try {
      console.log(`[Expense API] 删除消费记录 ID: ${id}`);
      const result = await offlineSync.deleteExpense(id);
      return result;
    } catch (error) {
      console.error(`删除消费记录失败 ID: ${id}:`, error);
      throw error;
    }
  }
};
