<template>
  <div class="expenses-container">
    <!-- 顶部操作区 -->
    <div class="header-actions"></div>

    <!-- 添加记录对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="t('expense.addDialogTitle')"
      width="80%"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item :label="t('expense.pasteContent')" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            :placeholder="t('expense.pastePlaceholder')"
            resize="vertical"
          />
        </el-form-item>

        <el-form-item>
          <el-text type="info" size="small">
            {{ t('expense.supportedFormat1') }}
          </el-text>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelAdd">{{ t('common.cancel') }}</el-button>
          <el-button
            type="primary"
            @click="handleAddExpense"
            :loading="loading"
          >
            {{ loading ? t('expense.adding') : t('common.submit') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 自定义添加对话框 -->
    <el-dialog
      v-model="showCustomAddDialog"
      :title="t('expense.customAddDialogTitle')"
      :width="dialogWidth"
      :close-on-click-modal="false"
    >
      <div id="customEntriesContainer">
        <div class="entry-group" v-for="(entry, index) in customEntries" :key="entry.id">
          <el-row :gutter="16">
            <el-col :span="6" :xs="24">
              <el-form-item :label="t('expense.type')" required>
                <el-select
                  v-model="entry.type"
                  :placeholder="t('expense.selectType')"
                  required
                >
                  <el-option
                    v-for="type in expenseTypes"
                    :key="type"
                    :label="type"
                    :value="type"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24">
              <el-form-item :label="t('expense.note')" required>
                <el-input
                  v-model="entry.note"
                  :placeholder="t('expense.enterNote')"
                  required
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24">
              <el-form-item :label="t('expense.amount')" required>
                <el-input
                  v-model.number="entry.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  :placeholder="t('expense.enterAmount')"
                  required
                />
              </el-form-item>
            </el-col>
            <el-col :span="4" :xs="12">
              <el-form-item :label="t('expense.date')">
                <el-date-picker
                  v-model="entry.date"
                  type="date"
                  value-format="YYYY-MM-DD"
                  :placeholder="t('expense.selectDate')"
                />
              </el-form-item>
            </el-col>
            <el-col :span="2" :xs="12" style="display: flex; align-items: flex-end; justify-content: center;">
              <el-button
                type="danger"
                icon="Delete"
                @click="removeCustomEntry(index)"
                v-if="index > 0"
              />
            </el-col>
          </el-row>
        </div>
      </div>
      <el-button type="primary" @click="addCustomEntry" style="margin-top: 10px;">
        {{ t('expense.addNewEntry') }}
      </el-button>

      <!-- 已输入内容预览表格 -->
      <div class="entries-preview" style="margin-top: 20px;">
        <h4 style="margin-bottom: 10px;">{{ t('expense.entriesPreview') }}</h4>
        <el-table :data="customEntries" size="small" border style="width: 100%" v-if="customEntries.length > 0">
          <template #empty>
            <p>{{ t('expense.noEntriesYet') }}</p>
          </template>
          <el-table-column prop="type" :label="t('expense.type')" width="120" />
          <el-table-column prop="note" :label="t('expense.note')" />
          <el-table-column prop="amount" :label="t('expense.amount')" width="100" align="right">
            <template #default="scope">{{ scope.row.amount.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="date" :label="t('expense.date')" width="120" />
        </el-table>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelCustomAdd">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitCustomEntries">{{ t('common.submit') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

import { addExpense, parseContentToExpenses } from '@/utils/browserDB';
import { useI18n } from 'vue-i18n';
defineOptions({ name: 'ExpensesView' });

const { t } = useI18n();
const expenseTypes = [
  '日常用品', '奢侈品', '通讯费用', '食品', '零食糖果', '冷饮', '方便食品', '纺织品', '饮品', '调味品', '交通出行', '餐饮', '医疗费用', '水果', '其他', '水产品', '乳制品', '礼物人情', '旅行度假', '政务', '水电煤气'
];

// 响应式数据
const showAddDialog = ref(false);
const showCustomAddDialog = ref(false);
const dialogWidth = ref('50%');
const form = ref({ content: '' });
const customEntries = ref([
  {
    type: '',
    note: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  }
]);
const loading = ref(false);
const formRef = ref();

// 响应式布局
const calculateDialogWidth = () => {
  if (window.innerWidth <= 768) {
    dialogWidth.value = '90%';
  } else if (window.innerWidth <= 1024) {
    dialogWidth.value = '90%';
  } else {
    dialogWidth.value = '90%';
  }
};

// 添加自定义条目
const addCustomEntry = () => {
  customEntries.value.push({
    type: '',
    note: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });
};

// 删除自定义条目
const removeCustomEntry = (index) => {
  customEntries.value.splice(index, 1);
};

// 取消自定义添加
const cancelCustomAdd = () => {
  showCustomAddDialog.value = false;
  customEntries.value = [{
    type: '',
    note: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  }];
};

// 提交自定义条目
const submitCustomEntries = async () => {
  try {
    loading.value = true;
    const records = customEntries.value
      .filter(entry => entry.type && entry.note && entry.amount > 0)
      .map(entry => ({
        type: entry.type,
        remark: entry.note,
        amount: entry.amount,
        time: entry.date
      }));

    if (records.length === 0) {
      ElMessage.warning(t('expense.noValidEntries'));
      return;
    }

    // 批量添加记录到浏览器数据库
    for (const record of records) {
      // 这里的addExpense是从browserDB导入的函数
      await addExpense(record);
    }
    
    ElMessage.success(t('expense.addSuccess', { count: records.length }));
    cancelCustomAdd();
  } catch (error) {
    console.error('添加失败:', error);
    ElMessage.error(error.response?.data?.message || t('expense.addFailed'));
  } finally {
    loading.value = false;
  }
};

// 添加消费记录
const handleAddExpense = async () => {
  if (!form.value.content.trim()) {
    ElMessage.warning(t('expense.inputValidContent'));
    return;
  }

  try {
    loading.value = true;
    // 解析文本内容为多条消费记录
    const records = await parseContentToExpenses(form.value.content);
    
    // 批量添加记录到浏览器数据库
    for (const record of records) {
      await addExpense(record);
    }
    
    ElMessage.success(t('expense.addSuccess', { count: records.length }));
    cancelAdd();
  } catch (error) {
    console.error('添加失败:', error);
    ElMessage.error(error.response?.data?.message || t('expense.addFailed'));
  } finally {
    loading.value = false;
  }
};

// 取消添加
const cancelAdd = () => {
  showAddDialog.value = false;
  form.value.content = '';
};

// 生命周期钩子
onMounted(() => {
  calculateDialogWidth();
  window.addEventListener('resize', calculateDialogWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', calculateDialogWidth);
});
</script>

<style scoped>
/* 在 Vue 的 <style> 标签里，不应该使用 import 语句来导入 CSS 文件，
   正确做法是使用 @import 规则。 */
@import '@/styles/expenses.css';
</style>
