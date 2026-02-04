import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'src', 'locales');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

const LOCALE_FILES = ['en-US.json', 'zh-CN.json', 'zh-TW.json'];

function getAllFiles(dir, extensions = ['.vue', '.js']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function extractUsedKeys(content) {
  const usedKeys = new Set();
  
  const patterns = [
    /\$t\(['"`]([^'"`]+)['"`]\)/g,
    /t\(['"`]([^'"`]+)['"`]\)/g,
    /i18n\.t\(['"`]([^'"`]+)['"`]\)/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  }
  
  return usedKeys;
}

function getAllUsedKeys() {
  const files = getAllFiles(SRC_DIR);
  const allUsedKeys = new Set();
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const keys = extractUsedKeys(content);
    keys.forEach(key => allUsedKeys.add(key));
  }
  
  return allUsedKeys;
}

function getAllDefinedKeys(localeFile) {
  const filePath = path.join(LOCALES_DIR, localeFile);
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  function extractKeys(obj, prefix = '') {
    const keys = [];
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...extractKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }
  
  return extractKeys(data);
}

function findUnusedKeys() {
  const usedKeys = getAllUsedKeys();
  const unusedKeys = {};
  
  for (const localeFile of LOCALE_FILES) {
    const definedKeys = getAllDefinedKeys(localeFile);
    const unused = definedKeys.filter(key => !usedKeys.has(key));
    unusedKeys[localeFile] = unused;
  }
  
  return unusedKeys;
}

function removeKeyFromObject(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) return false;
    current = current[keys[i]];
  }
  
  const lastKey = keys[keys.length - 1];
  if (current[lastKey] !== undefined) {
    delete current[lastKey];
    return true;
  }
  
  return false;
}

function removeUnusedKeys(unusedKeys, dryRun = true) {
  const results = {};
  
  for (const localeFile of LOCALE_FILES) {
    const filePath = path.join(LOCALES_DIR, localeFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    const removed = [];
    for (const key of unusedKeys[localeFile]) {
      if (removeKeyFromObject(data, key)) {
        removed.push(key);
      }
    }
    
    if (!dryRun && removed.length > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    
    results[localeFile] = {
      removed: removed,
      count: removed.length
    };
  }
  
  return results;
}

function printResults(unusedKeys) {
  console.log('\n=== 废弃的i18n键检测报告 ===\n');
  
  let totalUnused = 0;
  
  for (const localeFile of LOCALE_FILES) {
    const keys = unusedKeys[localeFile];
    if (keys.length > 0) {
      console.log(`\n${localeFile} (${keys.length} 个未使用的键):`);
      keys.forEach(key => {
        console.log(`  - ${key}`);
      });
      totalUnused += keys.length;
    } else {
      console.log(`\n${localeFile}: 没有未使用的键`);
    }
  }
  
  console.log(`\n总计: ${totalUnused} 个未使用的i18n键\n`);
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--remove');
  
  console.log('正在扫描项目文件...');
  const unusedKeys = findUnusedKeys();
  
  printResults(unusedKeys);
  
  if (dryRun) {
    console.log('这是预览模式。要实际移除这些键，请运行: node scripts/cleanup-i18n.js --remove');
  } else {
    console.log('\n正在移除未使用的键...');
    const results = removeUnusedKeys(unusedKeys, false);
    
    console.log('\n=== 移除结果 ===\n');
    for (const localeFile of LOCALE_FILES) {
      const result = results[localeFile];
      if (result.count > 0) {
        console.log(`${localeFile}: 已移除 ${result.count} 个键`);
      }
    }
    console.log('\n完成！');
  }
}

main();

export {
  getAllUsedKeys,
  getAllDefinedKeys,
  findUnusedKeys,
  removeUnusedKeys
};
