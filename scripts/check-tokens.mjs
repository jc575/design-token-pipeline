// Governance check that runs in the build. If a token change breaks contrast or ordering, the build fails.
// This is the part that makes a token pipeline a governance tool and not just a file converter.
import { readFileSync } from 'node:fs';

const r = JSON.parse(readFileSync('src/tokens/resolved.json', 'utf8'));

const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground token, background token, minimum ratio, rule]
const pairs = [
  ['text-primary', 'bg-page', 4.5, 'WCAG 1.4.3 text'],
  ['text-primary', 'bg-surface', 4.5, 'WCAG 1.4.3 text'],
  ['text-secondary', 'bg-page', 4.5, 'WCAG 1.4.3 text'],
  ['text-secondary', 'bg-surface', 4.5, 'WCAG 1.4.3 text'],
  ['action-primary-text', 'action-primary-bg', 4.5, 'WCAG 1.4.3 button label'],
  ['action-primary-text', 'action-primary-bg-hover', 4.5, 'WCAG 1.4.3 button label (hover)'],
  ['action-secondary-text', 'action-secondary-bg', 4.5, 'WCAG 1.4.3 button label'],
  ['action-secondary-text', 'action-secondary-bg-hover', 4.5, 'WCAG 1.4.3 button label (hover)'],
  ['action-secondary-border', 'action-secondary-bg', 3, 'WCAG 1.4.11 control boundary'],
  ['action-danger-text', 'action-danger-bg', 4.5, 'WCAG 1.4.3 button label'],
  ['action-danger-text', 'action-danger-bg-hover', 4.5, 'WCAG 1.4.3 button label (hover)'],
  ['focus-ring', 'bg-page', 3, 'WCAG 2.4.13 focus indicator vs page'],
  ['focus-ring', 'action-primary-bg', 3, 'WCAG 2.4.13 focus indicator vs primary fill'],
  ['focus-ring', 'action-danger-bg', 3, 'WCAG 2.4.13 focus indicator vs danger fill'],
  // Ordinal data colors: lightest step only needs 2:1 because every segment is also labeled and has a table view.
  ['data-severity-low', 'bg-surface', 2, 'Ordinal ramp light end (labeled + table alternative)'],
  ['data-severity-medium', 'bg-surface', 2, 'Ordinal ramp'],
  ['data-severity-high', 'bg-surface', 3, 'WCAG 1.4.11 graphic'],
  ['data-severity-critical', 'bg-surface', 3, 'WCAG 1.4.11 graphic']
];

const get = (mode, key) => {
  const v = r[mode][`--ds-color-${key}`];
  if (!v) throw new Error(`Token --ds-color-${key} missing in ${mode} mode`);
  return v;
};

let failures = 0;
const rows = [];
for (const mode of ['light', 'dark']) {
  for (const [fg, bg, min, rule] of pairs) {
    const ratio = contrast(get(mode, fg), get(mode, bg));
    const ok = ratio >= min;
    if (!ok) failures++;
    rows.push({ mode, pair: `${fg} on ${bg}`, ratio: ratio.toFixed(2), min, result: ok ? 'pass' : 'FAIL', rule });
  }
  // Severity must step monotonically so "worse" always reads as "more intense".
  const L = ['low', 'medium', 'high', 'critical'].map((s) => lum(get(mode, `data-severity-${s}`)));
  const falling = L.every((v, i) => i === 0 || v < L[i - 1]);
  const rising = L.every((v, i) => i === 0 || v > L[i - 1]);
  const expected = mode === 'light' ? falling : rising;
  if (!expected) failures++;
  rows.push({ mode, pair: 'severity low to critical is monotone', ratio: '-', min: '-', result: expected ? 'pass' : 'FAIL', rule: mode === 'light' ? 'darker means worse' : 'brighter means worse' });
}

console.table(rows);
if (failures) {
  console.error(`\n${failures} token check(s) failed. Fix the variable in Figma, re-export, and run npm run tokens.`);
  process.exit(1);
}
console.log(`\nAll ${rows.length} token checks passed.`);
