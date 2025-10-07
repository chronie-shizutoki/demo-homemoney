import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useExcelExport } from '@/composables/useExcelExport';
import { i18n } from '@/main';

export default {
  props: ['data'],
  methods: {
    exportCSV() {
      try {
        // 本地生成CSV文件
        const header = [i18n.global.t('expense.columns.date'), i18n.global.t('expense.columns.type'), i18n.global.t('expense.columns.amount'), i18n.global.t('expense.columns.remark')];
        const csvContent = [
          header.join(','), // CSV头部行
          ...this.data.map(expense => [
            expense.time,
            expense.type,
            `¥${expense.amount}`,
            expense.remark || '-'
          ].join(','))
        ].join('\n');
        
        // 创建Blob对象并下载
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'expenses.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('CSV导出成功');
      } catch (error) {
        console.error('导出CSV失败:', error);
      }
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