import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useExcelExport } from '@/composables/useExcelExport';
import { i18n } from '@/main';
import { getExpenses } from '@/utils/browserDB';

export default {
  props: ['data'],
  methods: {
    exportCSV() {
      getExpenses(1, 1000000) // 获取所有数据
        .then(expenses => {
          if (!expenses || expenses.length === 0) {
            console.warn('没有数据可导出');
            return;
          }
          
          // 将数据转换为CSV格式
          const headers = ['type', 'amount', 'time', 'remark'];
          const csvContent = [
            headers.join(','), // CSV头部
            ...expenses.map(expense => 
              headers.map(header => {
                const value = expense[header] || '';
                // 处理包含逗号、引号或换行符的值
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              }).join(',')
            )
          ].join('\n');
          
          // 创建Blob并下载
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          saveAs(blob, 'expenses.csv');
        })
        .catch(error => {
          console.error('导出CSV失败:', error);
        });
    },
    exportExcel() {
      const { exportToExcel } = useExcelExport();
      exportToExcel(this.data, i18n.global.t('expense.exportFilename'));
    }
  },
  render() {
    return (
      <div class="export-buttons">
        <button onClick={this.exportCSV}>导出CSV</button>
        <button onClick={this.exportExcel}>导出Excel</button>
      </div>
    )
  }
}