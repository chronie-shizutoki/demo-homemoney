// 移除了与后端API相关的导入，现在只使用前端数据库

/**
 * 前端数据库存储工具
 * 基于IndexedDB实现完整的数据存储功能，替代后端API
 */
class OfflineDataSync {
  constructor () {
    this.dbName = 'HomeMoneyDB';
    this.dbVersion = 2; // 增加版本号以支持新的存储结构
    this.stores = {
      cache: 'keyValueCache', // 键值对缓存存储
      syncQueue: 'syncQueue', // 待同步请求队列
      expenses: 'expenses' // 消费记录表
    };
    this.db = null;
    this.initDB();
    this.setupNetworkListeners();
  }

  /**
   * 初始化IndexedDB数据库
   */
  async initDB () {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;

        // 创建键值对缓存存储
        if (!this.db.objectStoreNames.contains(this.stores.cache)) {
          this.db.createObjectStore(this.stores.cache, { keyPath: 'key' });
        }

        // 创建同步队列存储（按时间戳排序）
        if (!this.db.objectStoreNames.contains(this.stores.syncQueue)) {
          this.db.createObjectStore(this.stores.syncQueue, {
            keyPath: 'id',
            autoIncrement: true
          });
        }

        // 创建消费记录表
        if (!this.db.objectStoreNames.contains(this.stores.expenses)) {
          const expenseStore = this.db.createObjectStore(this.stores.expenses, {
            keyPath: 'id',
            autoIncrement: true
          });
          // 创建索引以支持快速查询
          expenseStore.createIndex('date', 'date', { unique: false });
          expenseStore.createIndex('category', 'category', { unique: false });
          expenseStore.createIndex('amount', 'amount', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB初始化失败:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * 获取数据库事务
   */
  getTransaction (storeName, mode = 'readonly') {
    if (!this.db) return null;
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  /**
   * 缓存API响应数据
   */
  async cacheResponse (key, data) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.cache, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ key, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取缓存的响应数据
   */
  async getCachedResponse (key) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.cache);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 将请求添加到同步队列
   */
  async queueForSync (request) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.syncQueue, 'readwrite');
    return new Promise((resolve, reject) => {
      const requestData = {
        ...request,
        timestamp: Date.now()
      };
      const dbRequest = store.add(requestData);
      dbRequest.onsuccess = () => resolve(dbRequest.result);
      dbRequest.onerror = () => reject(dbRequest.error);
    });
  }

  /**
   * 获取所有待同步请求
   */
  async getSyncQueue () {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.syncQueue);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 移除已同步的请求
   */
  async removeFromSyncQueue (id) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.syncQueue, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 同步队列中的所有请求
   */
  async syncQueue () {
    // 由于我们已经不使用后端API，所以这个方法不再需要
    // 保留这个方法只是为了保持向后兼容性
    return;
  }

  /**
   * 添加消费记录
   */
  async addExpense (expense) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.expenses, 'readwrite');
    return new Promise((resolve, reject) => {
      const expenseData = {
        ...expense,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const request = store.add(expenseData);
      request.onsuccess = () => resolve({ id: request.result, ...expenseData });
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 批量添加消费记录
   */
  async addExpensesBatch (expenses) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.expenses, 'readwrite');
    return new Promise((resolve, reject) => {
      try {
        const results = [];
        let completedCount = 0;
        
        expenses.forEach(expense => {
          const expenseData = {
            ...expense,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const request = store.add(expenseData);
          request.onsuccess = () => {
            results.push({ id: request.result, ...expenseData });
            completedCount++;
            if (completedCount === expenses.length) {
              resolve(results);
            }
          };
          request.onerror = (error) => {
            reject(error);
          };
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取消费记录列表
   */
  async getExpenses (page = 1, limit = 10, searchParams = {}) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.expenses);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let expenses = request.result;
        
        // 应用搜索条件
        if (searchParams) {
          // 日期范围过滤
          if (searchParams.startDate) {
            expenses = expenses.filter(expense => expense.date >= searchParams.startDate);
          }
          if (searchParams.endDate) {
            expenses = expenses.filter(expense => expense.date <= searchParams.endDate);
          }
          
          // 分类过滤
          if (searchParams.type) {
            expenses = expenses.filter(expense => expense.type === searchParams.type);
          }
          
          // 关键词搜索
          if (searchParams.keyword) {
            const keyword = searchParams.keyword.toLowerCase();
            expenses = expenses.filter(expense => {
              return (expense.remark && expense.remark.toLowerCase().includes(keyword)) ||
                     (expense.type && expense.type.toLowerCase().includes(keyword));
            });
          }
        }
        
        // 排序（按日期降序）
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 分页
        const total = expenses.length;
        const offset = (page - 1) * limit;
        const paginatedExpenses = expenses.slice(offset, offset + limit);
        
        resolve({
          data: paginatedExpenses,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 更新消费记录
   */
  async updateExpense (id, expenseData) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.expenses, 'readwrite');
    
    return new Promise((resolve, reject) => {
      // 先获取现有记录
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existingExpense = getRequest.result;
        if (!existingExpense) {
          reject(new Error(`消费记录不存在: ${id}`));
          return;
        }
        
        // 更新记录
        const updatedExpense = {
          ...existingExpense,
          ...expenseData,
          updatedAt: new Date().toISOString()
        };
        
        const updateRequest = store.put(updatedExpense);
        updateRequest.onsuccess = () => resolve(updatedExpense);
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * 删除消费记录
   */
  async deleteExpense (id) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.expenses, 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve({ success: true });
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取消费统计数据
   */
  async getExpenseStatistics (searchParams = {}) {
    if (!this.db) await this.initDB();
    const store = this.getTransaction(this.stores.expenses);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let expenses = request.result;
        
        // 应用搜索条件
        if (searchParams) {
          if (searchParams.startDate) {
            expenses = expenses.filter(expense => expense.date >= searchParams.startDate);
          }
          if (searchParams.endDate) {
            expenses = expenses.filter(expense => expense.date <= searchParams.endDate);
          }
        }
        
        // 计算统计数据
        const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const totalCount = expenses.length;
        
        // 按分类统计
        const categoryStats = expenses.reduce((stats, expense) => {
          if (!stats[expense.category]) {
            stats[expense.category] = { amount: 0, count: 0 };
          }
          stats[expense.category].amount += parseFloat(expense.amount);
          stats[expense.category].count += 1;
          return stats;
        }, {});
        
        // 按日期统计
        const dateStats = expenses.reduce((stats, expense) => {
          const date = expense.date.split('T')[0]; // 获取日期部分
          if (!stats[date]) {
            stats[date] = { amount: 0, count: 0 };
          }
          stats[date].amount += parseFloat(expense.amount);
          stats[date].count += 1;
          return stats;
        }, {});
        
        resolve({
          totalAmount,
          totalCount,
          categoryStats,
          dateStats,
          averageAmount: totalCount > 0 ? totalAmount / totalCount : 0
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 设置网络状态监听
   */
  setupNetworkListeners () {
    // 网络恢复时同步队列
    window.addEventListener('online', () => this.syncQueue());

    // 页面加载时检查同步队列
    window.addEventListener('load', () => this.syncQueue());
  }
}

// 创建单例实例
const offlineSync = new OfflineDataSync();

export default offlineSync;


