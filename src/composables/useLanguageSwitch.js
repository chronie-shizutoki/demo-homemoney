/*
 * @file useLanguageSwitch.js
 * @package 家庭记账本
 * @module 组合式函数
 * @description 多语言切换功能组合式函数，负责管理应用语言状态和切换逻辑
 * @author 开发者
 * @version 1.0
*/

import { ref } from 'vue';
import i18n from '@/locales/i18n';

/**
 * 语言切换组合式函数
 * @returns {Object} 包含语言状态和切换方法的对象
 */
export function useLanguageSwitch () {
  /**
   * 当前应用语言（响应式数据）
   * @type {import('vue').Ref<string>}
   */
  // 项目使用组合式API模式（legacy: false），直接获取初始语言
  const currentLang = ref(i18n.global.locale.value);

  /**
   * 切换应用语言
   * @param {string} lang - 目标语言代码
   */
  const switchLanguage = (lang) => {
    // 项目使用组合式API模式（legacy: false），直接访问i18n.global.locale
    try {
      i18n.global.locale.value = lang;
      currentLang.value = lang;
      localStorage.setItem('appLang', lang); // 持久化存储语言设置
    } catch (error) {
      console.error('切换语言失败:', error);
    }
  };

  /**
   * 初始化语言设置（从本地存储读取）
   */
  const initLanguage = () => {
    const savedLang = localStorage.getItem('appLang');
    if (savedLang) switchLanguage(savedLang);
  };

  // 组件挂载时初始化语言
  initLanguage();

  return {
    currentLang,
    switchLanguage
  };
}
