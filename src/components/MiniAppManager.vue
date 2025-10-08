<template>
  <div class="mini-app-manager">
    
    <div v-if="isLoading" class="loading-state">
      <el-loading v-loading="isLoading" :element-loading-text="t('miniapp.loading')" />
    </div>
    
    <div v-else-if="miniApps.length === 0" class="empty-state">
      <p>{{ t('miniapp.emptyList') }}</p>
    </div>
    
    <div v-else class="mini-app-grid">
      <el-card
        v-for="app in miniApps"
        :key="app.id"
        class="mini-app-card"
        :hoverable="true"
      >
        <template #header>
          <div class="card-header">
            <span class="app-name">{{ app.name }}</span>
          </div>
        </template>
        <div class="card-content">
          <p class="app-description">{{ app.description || t('miniapp.appDescription') }}</p>
          <p class="app-info">{{ t('miniapp.version') }}: {{ app.version || '1.0.0' }}</p>
          <p class="app-info">{{ t('miniapp.author') }}: {{ app.author || 'Unknown' }}</p>
          <el-button 
            type="primary" 
            class="open-app-btn" 
            @click="openMiniApp(app)"
          >
            <el-icon><Open /></el-icon>
            {{ t('miniapp.openApp') }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElCard, ElButton, ElLoading } from 'element-plus';
import { Open } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isLoading = ref(false);

// 本地迷你应用列表配置
const localMiniApps = [
  {
    id: 'calculator',
    name: '液态玻璃计算器',
    description: '一个简洁实用的在线计算器小程序，支持基本的数学运算，具有液态玻璃效果和自动深色模式适配',
    version: '1.1.0',
    author: '系统内置',
    path: '/miniapp/calculator/index.html'
  },
  {
    id: 'text-encryptor',
    name: "文本加密工具",
    description: "使用AES-256加密算法的文本加密工具，支持将加密结果转换为拟声词组合",
    version: "1.0.0",
    author: "胖猪",
    path: "/miniapp/text-encryptor/index.html"
  }
];

const miniApps = computed(() => localMiniApps);

// 扫描小程序目录
const scanMiniApps = async () => {
  isLoading.value = true;
  try {
    // 由于使用本地存储，这里不再需要调用后端API
    // 我们直接使用预定义的本地应用列表
    console.log('使用本地迷你应用列表');
  } catch (error) {
    console.error('扫描小程序失败:', error);
  } finally {
    // 为了保持UI一致性，仍然保留短暂的加载状态
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
};

// 打开小程序
const openMiniApp = (app) => {
  try {
    // 在新窗口中打开小程序
    const appUrl = window.location.origin + app.path;
    window.open(appUrl, '_blank');
  } catch (error) {
    console.error('打开小程序失败:', error);
  }
};

// 组件挂载时扫描小程序
onMounted(() => {
  scanMiniApps();
});
</script>

<style scoped>
.mini-app-manager {
  padding: 20px;
}

.mini-app-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 10px;
  color: #999;
}

.mini-app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.mini-app-card {
  transition: all 0.3s ease;
}

.mini-app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.card-content {
  padding: 15px 0;
}

.app-description {
  margin-bottom: 10px;
  color: #666;
  font-size: 0.95rem;
}

.app-info {
  margin-bottom: 5px;
  font-size: 0.85rem;
  color: #999;
}

.open-app-btn {
  margin-top: 15px;
  width: 100%;
}

@media (max-width: 768px) {
  .mini-app-grid {
    grid-template-columns: 1fr;
  }
}
</style>