import axios from 'axios';

// 使用本地存储的BrowserDB替代后端API
import browserDB from '../utils/browserDB';

export const DebtAPI = {
  /**
   * 获取债务记录列表
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @param {string} params.type 债务类型：'lend'（借出）或 'borrow'（借入）
   * @param {boolean} params.isRepaid 是否已还款
   * @returns {Promise<Array>} 债务记录列表
   */
  async getDebts (params = {}) {
    try {
      console.log('[Debt API] 从本地存储获取债务记录');
      const debts = await browserDB.getDebts(params);
      // 模拟API响应格式
      return debts;
    } catch (error) {
      console.error('获取债务记录失败:', error);
      throw error;
    }
  },

  /**
   * 添加新的债务记录
   * @param {Object} data 债务数据
   * @param {string} data.type 债务类型：'lend'（借出）或 'borrow'（借入）
   * @param {string} data.person 交易对方姓名
   * @param {number} data.amount 交易金额
   * @param {string|Date} data.date 交易日期
   * @param {boolean} data.isRepaid 是否已还款
   * @param {string} data.remark 备注
   * @returns {Promise<Object>} 添加的债务记录
   */
  async addDebt (data) {
    try {
      console.log('[Debt API] 添加债务记录到本地存储');
      const result = await browserDB.addDebt(data);
      return {
        data: result,
        status: 200,
        statusText: 'OK'
      };
    } catch (error) {
      console.error('添加债务记录失败:', error);
      throw error;
    }
  },

  /**
   * 更新债务记录
   * @param {string|number} id 债务记录ID
   * @param {Object} data 更新的债务数据
   * @returns {Promise<Object>} 更新后的债务记录
   */
  async updateDebt (id, data) {
    try {
      console.log('[Debt API] 更新本地存储中的债务记录');
      const result = await browserDB.updateDebt(id, data);
      return {
        data: result,
        status: 200,
        statusText: 'OK'
      };
    } catch (error) {
      console.error('更新债务记录失败:', error);
      throw error;
    }
  },

  /**
   * 删除债务记录
   * @param {string|number} id 债务记录ID
   * @returns {Promise<void>}
   */
  async deleteDebt (id) {
    try {
      console.log('[Debt API] 从本地存储删除债务记录');
      await browserDB.deleteDebt(id);
      return {
        status: 204,
        statusText: 'No Content'
      };
    } catch (error) {
      console.error('删除债务记录失败:', error);
      throw error;
    }
  }
};