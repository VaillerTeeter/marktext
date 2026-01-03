const en = require('./src/renderer/locales/en.js').default;
const zh = require('./src/renderer/locales/zh-CN.js').default;

function getKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(fullKey);
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

const enKeys = getKeys(en);
const zhKeys = getKeys(zh);

console.log('EN keys:', enKeys.length);
console.log('ZH keys:', zhKeys.length);

const enOnly = enKeys.filter(k => !zhKeys.includes(k));
const zhOnly = zhKeys.filter(k => !enKeys.includes(k));

if (enOnly.length > 0) {
  console.log('\nKeys only in EN:');
  enOnly.forEach(k => console.log('  -', k));
}

if (zhOnly.length > 0) {
  console.log('\nKeys only in ZH:');
  zhOnly.forEach(k => console.log('  -', k));
}

if (enOnly.length === 0 && zhOnly.length === 0) {
  console.log('\n✓ All keys match!');
}
