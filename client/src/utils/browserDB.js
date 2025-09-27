/**
 * 浏览器数据库服务
 * 替代后端，使用IndexedDB存储所有应用数据
 */
class BrowserDB {
  constructor() {
    this.dbName = 'HomeMoneyDB';
    this.dbVersion = 2; // 增加版本号以支持新的存储结构
    this.stores = {
      expenses: 'expenses',
      debts: 'debts',
      todos: 'todos',
      settings: 'settings'
    };
    this.db = null;
    this.initDB();
  }

  /**
   * 初始化IndexedDB数据库
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;

        // 创建消费记录存储
        if (!this.db.objectStoreNames.contains(this.stores.expenses)) {
          const expenseStore = this.db.createObjectStore(this.stores.expenses, {
            keyPath: 'id',
            autoIncrement: true
          });
          expenseStore.createIndex('time', 'time');
          expenseStore.createIndex('category', 'category');
        }

        // 创建债务记录存储
        if (!this.db.objectStoreNames.contains(this.stores.debts)) {
          const debtStore = this.db.createObjectStore(this.stores.debts, {
            keyPath: 'id',
            autoIncrement: true
          });
          debtStore.createIndex('date', 'date');
          debtStore.createIndex('type', 'type');
          debtStore.createIndex('isRepaid', 'isRepaid');
        }

        // 创建待办事项存储
        if (!this.db.objectStoreNames.contains(this.stores.todos)) {
          const todoStore = this.db.createObjectStore(this.stores.todos, {
            keyPath: 'id'
          });
          todoStore.createIndex('completed', 'completed');
          todoStore.createIndex('createdAt', 'createdAt');
        }

        // 创建设置存储
        if (!this.db.objectStoreNames.contains(this.stores.settings)) {
          this.db.createObjectStore(this.stores.settings, {
            keyPath: 'key'
          });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('BrowserDB initialized successfully');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('BrowserDB initialization failed:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * 获取数据库事务
   */
  getTransaction(storeName, mode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  /**
   * 确保数据库已初始化
   */
  async ensureDB() {
    if (!this.db) {
      await this.initDB();
    }
  }

  // =============== 消费记录操作 ===============

  /**
   * 获取所有消费记录
   */
  async getExpenses(page = 1, limit = 1000000) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.expenses);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allExpenses = request.result || [];
        // 模拟分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedExpenses = allExpenses.slice(startIndex, endIndex);
        resolve(paginatedExpenses);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 添加单条消费记录
   */
  async addExpense(data) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.expenses, 'readwrite');
    
    // 格式化数据
    const expenseData = {
      ...data,
      amount: parseFloat(data.amount),
      time: data.time || new Date().toISOString(),
      remark: data.remark || ''
    };

    return new Promise((resolve, reject) => {
      const request = store.add(expenseData);
      request.onsuccess = () => {
        resolve({ id: request.result, ...expenseData });
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 批量添加消费记录
   */
  async addExpensesBatch(records) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.expenses, 'readwrite');
    
    return new Promise((resolve, reject) => {
      const transaction = store.transaction;
      
      try {
        records.forEach(record => {
          const expenseData = {
            ...record,
            amount: parseFloat(record.amount),
            time: record.time || new Date().toISOString(),
            remark: record.remark || ''
          };
          store.add(expenseData);
        });
        
        transaction.oncomplete = () => resolve({ success: true, count: records.length });
        transaction.onerror = () => reject(transaction.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取消费统计数据
   */
  async getExpenseStatistics() {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.expenses);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const expenses = request.result || [];
        const statistics = {
          totalAmount: expenses.reduce((sum, expense) => sum + Math.abs(parseFloat(expense.amount) || 0), 0),
          count: expenses.length,
          categories: {},
          monthlyData: {}
        };
        
        // 计算分类统计和月度统计
        expenses.forEach(expense => {
          const category = expense.category || '未分类';
          const amount = Math.abs(parseFloat(expense.amount) || 0);
          const month = (new Date(expense.time)).toISOString().slice(0, 7); // YYYY-MM
          
          // 分类统计
          if (!statistics.categories[category]) {
            statistics.categories[category] = 0;
          }
          statistics.categories[category] += amount;
          
          // 月度统计
          if (!statistics.monthlyData[month]) {
            statistics.monthlyData[month] = 0;
          }
          statistics.monthlyData[month] += amount;
        });
        
        resolve(statistics);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // =============== 债务记录操作 ===============

  /**
   * 获取债务记录列表
   */
  async getDebts(params = {}) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.debts);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let debts = request.result || [];
        
        // 应用过滤条件
        if (params.type) {
          debts = debts.filter(debt => debt.type === params.type);
        }
        if (params.isRepaid !== undefined) {
          debts = debts.filter(debt => debt.isRepaid === params.isRepaid);
        }
        
        // 模拟分页
        const page = params.page || 1;
        const limit = params.limit || 1000000;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedDebts = debts.slice(startIndex, endIndex);
        
        resolve(paginatedDebts);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 添加新的债务记录
   */
  async addDebt(data) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.debts, 'readwrite');
    
    // 格式化数据
    const debtData = {
      ...data,
      amount: parseFloat(data.amount),
      date: data.date || new Date().toISOString(),
      isRepaid: data.isRepaid || false
    };

    return new Promise((resolve, reject) => {
      const request = store.add(debtData);
      request.onsuccess = () => {
        resolve({ id: request.result, ...debtData });
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 更新债务记录
   */
  async updateDebt(id, data) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.debts, 'readwrite');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existingDebt = getRequest.result;
        if (!existingDebt) {
          reject(new Error(`Debt with id ${id} not found`));
          return;
        }
        
        // 合并数据
        const updatedDebt = {
          ...existingDebt,
          ...data,
          amount: data.amount !== undefined ? parseFloat(data.amount) : existingDebt.amount
        };
        
        const putRequest = store.put(updatedDebt);
        putRequest.onsuccess = () => resolve(updatedDebt);
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * 删除债务记录
   */
  async deleteDebt(id) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.debts, 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // =============== 待办事项操作 ===============

  /**
   * 获取所有待办事项
   */
  async getTodos() {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.todos);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 保存待办事项列表
   */
  async saveTodos(todos) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.todos, 'readwrite');
    
    return new Promise((resolve, reject) => {
      const transaction = store.transaction;
      
      // 先清空现有数据
      store.clear();
      
      // 保存新数据
      try {
        todos.forEach(todo => {
          store.put(todo);
        });
        
        transaction.oncomplete = () => resolve({ success: true });
        transaction.onerror = () => reject(transaction.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  // =============== 设置操作 ===============

  /**
   * 保存设置
   */
  async saveSetting(key, value) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.settings, 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve({ key, value });
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取设置
   */
  async getSetting(key, defaultValue = null) {
    await this.ensureDB();
    const store = this.getTransaction(this.stores.settings);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 导出所有数据（用于备份）
   */
  async exportAllData() {
    const [expenses, debts, todos] = await Promise.all([
      this.getExpenses(),
      this.getDebts(),
      this.getTodos()
    ]);
    
    return {
      expenses,
      debts,
      todos,
      exportTime: new Date().toISOString()
    };
  }

  /**
   * 解析文本内容为多条消费记录
   */
  async parseContentToExpenses(content) {
    const lines = content.trim().split('\n');
    const records = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // 简单的解析逻辑示例
      // 格式: [类型] [备注] [金额] [日期]
      const parts = trimmedLine.split(/\s+/);
      if (parts.length >= 3) {
        const amount = parseFloat(parts[parts.length - 1]);
        const date = parts.length >= 4 ? parts[parts.length - 2] : new Date().toISOString().split('T')[0];
        const typeAndNote = parts.slice(0, parts.length - 1).join(' ');
        
        // 提取类型（这里简化处理，实际可能需要更复杂的逻辑）
        let type = '其他';
        const note = typeAndNote;
        
        records.push({
          type,
          remark: note,
          amount,
          time: date,
          category: 'expense' // 默认分类
        });
      }
    }
    
    return records;
  }

  /**
   * 导入数据（用于恢复）
   */
  async importAllData(data) {
    await this.ensureDB();
    
    // 使用一个事务处理所有导入操作
    const transaction = this.db.transaction(
      [this.stores.expenses, this.stores.debts, this.stores.todos],
      'readwrite'
    );
    
    const expenseStore = transaction.objectStore(this.stores.expenses);
    const debtStore = transaction.objectStore(this.stores.debts);
    const todoStore = transaction.objectStore(this.stores.todos);
    
    // 清空现有数据
    await Promise.all([
      new Promise(resolve => { expenseStore.clear().onsuccess = resolve; }),
      new Promise(resolve => { debtStore.clear().onsuccess = resolve; }),
      new Promise(resolve => { todoStore.clear().onsuccess = resolve; })
    ]);
    
    // 导入新数据
    if (data.expenses && Array.isArray(data.expenses)) {
      data.expenses.forEach(expense => expenseStore.add(expense));
    }
    
    if (data.debts && Array.isArray(data.debts)) {
      data.debts.forEach(debt => debtStore.add(debt));
    }
    
    if (data.todos && Array.isArray(data.todos)) {
      data.todos.forEach(todo => todoStore.add(todo));
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve({ success: true });
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// 创建单例实例
const browserDB = new BrowserDB();

// 导出默认实例
export default browserDB;

// 导出常用方法
export const addExpense = browserDB.addExpense.bind(browserDB);
export const getExpenses = browserDB.getExpenses.bind(browserDB);
export const addExpensesBatch = browserDB.addExpensesBatch.bind(browserDB);
export const parseContentToExpenses = browserDB.parseContentToExpenses.bind(browserDB);