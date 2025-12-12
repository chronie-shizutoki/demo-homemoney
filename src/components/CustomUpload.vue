<template>
  <div class="custom-upload">
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="file-input"
      @change="handleFileChange"
      style="display: none;"
    />
    <slot :trigger-upload="triggerUpload"></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { ExpenseAPI } from '@/api/expenses';

const props = defineProps({
  accept: {
    type: String,
    default: ''
  },
  showFileList: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['success', 'error']);

const fileInput = ref(null);

const triggerUpload = (event) => {
  event.preventDefault();
  fileInput.value?.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // 读取Excel文件
    const fileData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e.target.error);
      reader.readAsArrayBuffer(file);
    });

    // 解析Excel文件
    const workbook = XLSX.read(fileData, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // 转换数据格式并保存到前端数据库
    const importedData = [];
    for (const item of jsonData) {
      // 假设Excel文件中有以下列：type, remark, amount, date
      const expenseData = {
        type: item.type?.toString().trim() || '',
        remark: item.remark?.toString().trim() || '',
        amount: parseFloat(item.amount) || 0,
        date: item.date?.toString() || new Date().toISOString().split('T')[0]
      };

      if (expenseData.type && expenseData.amount > 0) {
        const result = await ExpenseAPI.addExpense(expenseData);
        importedData.push(result);
      }
    }

    emit('success', { importedCount: importedData.length }, file);
  } catch (error) {
    emit('error', {
      status: 0,
      response: null,
      responseText: error.message
    }, file);
  } finally {
    // 重置文件输入，以便可以重新选择相同的文件
    event.target.value = '';
  }
};
</script>

<style scoped>
.custom-upload {
  display: inline-block;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
</style>
