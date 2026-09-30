/**
 * Regenerate src/locales/vi.ts from quinstowndotcom Vietnamese locale.
 * Run: npm run sync-locales
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(__dirname, '../../quinstowndotcom/src/locales');
const dest = path.resolve(__dirname, '../src/locales');

const KEY_RE =
  /^\s+((?:cit|resources|nav_resources|course|footer|site)[a-z0-9_]*):\s*/;

function shouldInclude(key) {
  return (
    key.startsWith('cit_') ||
    key.startsWith('resources_') ||
    key.startsWith('nav_resources') ||
    key.startsWith('course_') ||
    key.startsWith('footer_') ||
    key.startsWith('site_')
  );
}

function parseLocale(file) {
  const content = fs.readFileSync(path.join(srcRoot, file), 'utf8');
  const obj = {};
  const blocks = content.split(/\n(?=\s+(?:cit|resources|nav_resources|course|footer|site)[a-z0-9_]*:)/);
  for (const block of blocks) {
    const km = block.match(KEY_RE);
    if (!km) continue;
    const key = km[1];
    if (!shouldInclude(key)) continue;
    let rest = block.slice(km[0].length).trim();
    const firstLine = rest.split('\n')[0].trim().replace(/,$/, '');
    try {
      obj[key] = Function(`return (${firstLine});`)();
    } catch {
      const sm =
        firstLine.match(/^'([\s\S]*)'$/s) ||
        firstLine.match(/^"([\s\S]*)"$/s);
      if (sm) obj[key] = sm[1];
    }
  }
  return obj;
}

function pickDefaults(obj) {
  obj.site_name = obj.site_name || 'thiquoctichuc.com';
  obj.site_title =
    obj.site_title || 'thiquoctichuc.com · Học & thi thử';
  obj.site_description =
    obj.site_description ||
    obj.cit_derived ||
    'Tóm tắt học và đề thi thử không chính thức.';
  obj.footer_copyright_prefix = obj.footer_copyright_prefix || '©';
  obj.footer_copyright_by = obj.footer_copyright_by || 'bởi';
  obj.cit_loading = obj.cit_loading || 'Đang tải…';
  obj.cit_no_questions = obj.cit_no_questions || 'Không có câu hỏi.';
  obj.cit_next = obj.cit_next === 'Next' ? 'Tiếp' : obj.cit_next || 'Tiếp';
  return obj;
}

function serialize(name, obj) {
  const lines = Object.keys(obj)
    .sort()
    .map((k) => `  ${k}: ${JSON.stringify(obj[k])},`);
  return `const ${name} = {\n${lines.join('\n')}\n};\n\nexport default ${name};\n`;
}

const vi = pickDefaults(parseLocale('vi.ts'));
fs.writeFileSync(path.join(dest, 'vi.ts'), serialize('vi', vi));
console.log(`Wrote ${Object.keys(vi).length} keys to src/locales/vi.ts`);
