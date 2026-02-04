import { createApp } from 'vue';

import './styles/common.css';
import './styles/fonts.css';

import router from './router';
import i18n from './locales/i18n.js';
import { createPinia } from 'pinia';

// 导入Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// 导入Solid风格图标
import {
  faPlus, faUpload, faDownload, faMicrochip,
  faFileAlt, faStar, faEnvelope, faQuestionCircle,
  faChartPie, faSyncAlt, faCog, faChartLine, faTimes,
  faEdit, faTrashAlt, faFileExport
} from '@fortawesome/free-solid-svg-icons'

// 将图标添加到库中
library.add(
  faPlus, faUpload, faDownload, faMicrochip,
  faFileAlt, faStar, faEnvelope, faQuestionCircle,
  faChartPie, faSyncAlt, faCog, faChartLine, faTimes,
  faEdit, faTrashAlt, faFileExport
)

import App from './App.vue';

export { i18n };
const pinia = createPinia();

const app = createApp({
  components: { App },
  template: `
    <Suspense>
      <App />
      <template #fallback>Loading...</template>
    </Suspense>
  `
});
app.use(pinia); // 安装Pinia实例

// 注册Font Awesome组件
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(router);
app.use(i18n);
app.mount('#app');
console.log('[App Initialization] Application mounted successfully');

// 记录应用启动日志
// 移除应用启动日志记录，避免增加日志量

// 深色模式适配
const applyDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
};

// 检测系统主题偏好
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
applyDarkMode(mediaQuery.matches);

// 监听主题变化
mediaQuery.addEventListener('change', (e) => {
  applyDarkMode(e.matches);
});
