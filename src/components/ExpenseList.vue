<!-- ExpenseList.vue -->
<template>
  <div class="expense-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>{{ $t('expense.loading') }}</p>
    </div>

    <template v-else>
      <!-- 搜索组件 -->
      <ExpenseSearch
  ref="searchComponent"
  :uniqueTypes="uniqueTypes"
  :availableMonths="availableMonths"
  :initialKeyword="searchParams.keyword"
  :initialType="searchParams.type"
  :initialMonth="searchParams.month"
  :initialMinAmount="searchParams.minAmount"
        :initialMaxAmount="searchParams.maxAmount"
        :initialSortOption="searchParams.sortOption"
        @search="handleSearch"
      />

      <!-- 空状态提示 -->
      <div v-if="filteredExpenses.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M19,13H5V11H19V13M12,5A2,2 0 0,1 14,7A2,2 0 0,1 12,9A2,2 0 0,1 10,7A2,2 0 0,1 12,5Z" />
          </svg>
        </div>
        <h3>{{ $t('expense.empty.title') }}</h3>
        <p>{{ $t('expense.empty.description') }}</p>
        <button @click="resetFilters" class="reset-button">
          {{ $t('expense.empty.reset') }}
        </button>
      </div>

      <template v-else>
        <!-- 统计组件 -->
        <ExpenseStats :statistics="statistics" />

        <!-- 表格组件 -->
        <ExpenseTable
          :expenses="paginatedExpenses"
          :sortOption="searchParams.sortOption"
          @sort="sortBy"
        />

        <!-- 分页组件 -->
        <ExpensePagination
          v-if="totalPages > 1"
          :currentPage="currentPage"
          :totalPages="totalPages"
          :visiblePages="visiblePages"
          @page-change="changePage"
        />
      </template>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as math from 'mathjs';
import ExpenseStats from './ExpenseStats.vue';
import ExpenseSearch from './ExpenseSearch.vue';
import ExpenseTable from './ExpenseTable.vue';
import ExpensePagination from './ExpensePagination.vue';
import { getTypeColor } from '../utils/expenseUtils';

export default {
  components: {
    ExpenseStats,
    ExpenseSearch,
    ExpenseTable,
    ExpensePagination
  },

  props: {
    expenses: { type: Array, default: () => [] }
  },

  setup (props) {
    const { t } = useI18n();
    const searchComponent = ref(null);
    const loading = ref(true);

    // 统一搜索参数
    const searchParams = ref({
      keyword: '',
      type: '',
      month: '',
      minAmount: null,
      maxAmount: null,
      sortOption: 'dateDesc'
    });

    // 分页相关状态
    const currentPage = ref(1);
    const pageSize = ref(10);

    // 搜索处理
    const handleSearch = (params) => {
      searchParams.value = { ...params };
      currentPage.value = 1;
    };

    // 重置所有筛选条件
    const resetFilters = () => {
      if (searchComponent.value) {
        searchComponent.value.handleReset();
      }
    };

    // 预先计算所有可能类型
    const uniqueTypes = computed(() => {
      return [...new Set(props.expenses.map(expense => expense.type))];
    });

    const availableMonths = computed(() => {
      const months = props.expenses.map(expense => {
        const date = new Date(expense.time);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      });
      return [...new Set(months)].sort().reverse();
    });

    // 过滤和排序组合
    const filteredExpenses = computed(() => {
      const { keyword, type, month, minAmount, maxAmount, sortOption } = searchParams.value;
      const keywordLower = keyword.toLowerCase();

      // 过滤逻辑
      const results = props.expenses.filter(expense => {
        // 类型筛选
        if (type && expense.type !== type) return false;

        // 月份筛选
        if (month) {
          try {
            const expenseDate = new Date(expense.time);
            if (isNaN(expenseDate.getTime())) return false;
            const expenseMonth = expenseDate.toISOString().slice(0, 7);
            if (expenseMonth !== month) return false;
          } catch {
            return false;
          }
        }

        // 金额范围筛选
        const amount = Number(expense.amount);
        if (minAmount !== null && amount < minAmount) return false;
        if (maxAmount !== null && amount > maxAmount) return false;

        // 关键词筛选
        if (keyword) {
          const fields = [expense.time, expense.type, expense.remark];
          const matches = fields.some(field =>
            field && String(field).toLowerCase().includes(keywordLower)
          );
          if (!matches) return false;
        }

        return true;
      });

      // 排序逻辑
      return [...results].sort((a, b) => {
        const aTime = new Date(a.time).getTime();
        const bTime = new Date(b.time).getTime();
        const aAmount = Number(a.amount);
        const bAmount = Number(b.amount);

        switch (sortOption) {
        case 'dateAsc': return aTime - bTime;
        case 'dateDesc': return bTime - aTime;
        case 'amountAsc': return aAmount - bAmount;
        case 'amountDesc': return bAmount - aAmount;
        default: return 0;
        }
      });
    });

    // 分页处理
    const paginatedExpenses = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredExpenses.value.slice(start, end);
    });

    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredExpenses.value.length / pageSize.value) || 1;
    });

    // 引入 window 以方便测试模拟
    const { innerWidth } = window;
    // 可见页码（小屏幕最多显示3个，大屏幕最多显示5个）
    const visiblePages = computed(() => {
      const pages = [];
      const total = totalPages.value;
      const current = currentPage.value;
      // 根据屏幕宽度确定最多显示的页码数
      const maxVisible = innerWidth < 768 ? 1 : 5;

      if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        const start = Math.max(1, current - Math.floor(maxVisible / 2));
        const end = Math.min(total, start + maxVisible - 1);

        if (start > 1) pages.push(1);
        if (start > 2) pages.push('...');

        for (let i = start; i <= end; i++) pages.push(i);

        if (end < total - 1) pages.push('...');
        if (end < total) pages.push(total);
      }

      return pages;
    });

    // 统计计算
    const statistics = computed(() => {
      const amounts = filteredExpenses.value.map(e => Number(e.amount));
      const count = amounts.length;

      if (count === 0) {
        return {
          count: 0,
          totalAmount: '0.00',
          averageAmount: '0.00',
          medianAmount: '0.00',
          minAmount: '0.00',
          maxAmount: '0.00',
          uniqueTypeCount: 0,
          typeDistribution: {}
        };
      }

      const total = math.sum(amounts);
      const average = total / count;
      const sorted = [...amounts].sort((a, b) => a - b);
      const median = count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];

      // 类型分布统计
      const typeDistribution = {};
      filteredExpenses.value.forEach(expense => {
        const type = expense.type || t('expense.unknownType');
        if (!typeDistribution[type]) {
          typeDistribution[type] = { count: 0, amount: 0 };
        }
        typeDistribution[type].count++;
        typeDistribution[type].amount += Number(expense.amount);
      });

      // 计算每种类型的占比
      Object.keys(typeDistribution).forEach(type => {
        typeDistribution[type].percentage =
          Math.round((typeDistribution[type].count / count) * 100);
      });

      return {
        count,
        totalAmount: total.toFixed(2),
        averageAmount: average.toFixed(2),
        medianAmount: median.toFixed(2),
        minAmount: math.min(...amounts).toFixed(2),
        maxAmount: math.max(...amounts).toFixed(2),
        uniqueTypeCount: Object.keys(typeDistribution).length,
        typeDistribution
      };
    });

    // 页面切换方法
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    // 排序方法
    const sortBy = (field) => {
      const currentSort = searchParams.value.sortOption;
      let newSort = '';

      if (field === 'time') {
        newSort = currentSort === 'dateAsc' ? 'dateDesc' : 'dateAsc';
      } else if (field === 'amount') {
        newSort = currentSort === 'amountAsc' ? 'amountDesc' : 'amountAsc';
      }

      if (newSort) {
        searchParams.value.sortOption = newSort;
      }
    };

    // 模拟加载延迟
    onMounted(() => {
      setTimeout(() => {
        loading.value = false;
      }, 800);
    });

    return {
      searchComponent,
      loading,
      searchParams,
      currentPage,
      pageSize,
      uniqueTypes,
      availableMonths,
      filteredExpenses,
      paginatedExpenses,
      totalPages,
      visiblePages,
      statistics,
      getTypeColor,
      handleSearch,
      resetFilters,
      changePage,
      sortBy
    };
  }
};
</script>

<style scoped>
.expense-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding: 0 10px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4361ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  background: transparent;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f0f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  fill: #4361ee;
}

.empty-state h3 {
  margin: 0 0 10px;
  font-size: 1.4rem;
  color: #2c3e50;
}

.empty-state p {
  margin: 0 0 20px;
  color: #6c757d;
  max-width: 500px;
  line-height: 1.6;
}

.reset-button {
  padding: 10px 25px;
  background: linear-gradient(135deg, #4361ee, #3a56d4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

@media (max-width: 768px) {
  .expense-list {
    gap: 15px;
  }

  .empty-state {
    padding: 30px 15px;
  }
}
</style>
