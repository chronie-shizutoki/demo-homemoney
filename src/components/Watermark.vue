<template>
  <div class="watermark-container">
    <div 
      v-for="index in watermarkCount" 
      :key="index" 
      class="watermark-text"
      :style="getWatermarkStyle(index)"
    >
      {{ watermarkText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 计算水印数量，确保覆盖整个屏幕
const watermarkCount = 20;

// 水印文本，中英文结合
const watermarkText = computed(() => {
  // 根据当前语言选择不同的水印文本
  const currentLocale = t('app.locale');
  if (currentLocale.includes('zh')) {
    return '演示版本 Demo Version';
  } else {
    return 'Demo Version 演示版本';
  }
});

// 计算每个水印的位置和旋转角度
const getWatermarkStyle = (index) => {
  // 创建网格布局的水印位置
  const colCount = 5;
  const rowIndex = Math.floor(index / colCount);
  const colIndex = index % colCount;
  
  // 随机微调位置，使水印分布更自然
  const xOffset = colIndex * 20 + Math.random() * 5;
  const yOffset = rowIndex * 25 + Math.random() * 5;
  
  // 固定左倾斜25度
  const rotation = -25;
  
  return {
    left: `${xOffset}%`,
    top: `${yOffset}%`,
    transform: `rotate(${rotation}deg)`
  };
};
</script>

<style scoped>
.watermark-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999; /* 确保水印在最上层但不影响用户交互 */
  overflow: hidden;
}

.watermark-text {
  position: absolute;
  font-size: 18px;
  font-weight: 400;
  opacity: 0.3;
  color: var(--text-primary);
  white-space: nowrap;
  transform-origin: center;
  user-select: none;
  transition: opacity 0.3s ease;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .watermark-text {
    color: var(--dark-text-primary, #e0e0e0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .watermark-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .watermark-text {
    font-size: 12px;
    opacity: 0.08;
  }
}
</style>