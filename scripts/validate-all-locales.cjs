const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');

const FILES = [
  'mintcom-website/src/i18n/locales/en.json',
  'mintcom-website/src/i18n/locales/ar.json',
  'mintcom-website/src/i18n/locales/zh.json',
  'mintcom-pos/src/i18n/locales/en.json',
  'mintcom-pos/src/i18n/locales/ar.json',
  'mintcom-admin-portal/src/translations/en.json',
  'mintcom-admin-portal/src/translations/ar.json',
  'mintcom-admin-portal/src/translations/zh.json',
];

const MOJIBAKE_REGEX = /[ÃÂâØÙ]/g;

function checkFile(relPath) {
  const absPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(absPath)) {
    if (relPath.startsWith('mintcom-pos/') || relPath.startsWith('mintcom-admin-portal/')) {
      console.log(`SKIP: Sibling repo not checked out in standalone CI: ${relPath}`);
      return 'SKIP';
    }
    console.error(`FAILED: File not found: ${relPath}`);
    return false;
  }
  const content = fs.readFileSync(absPath, 'utf8');

  const mojibakeMatches = content.match(MOJIBAKE_REGEX);
  if (mojibakeMatches && mojibakeMatches.length > 0) {
    console.error(`FAILED: Mojibake detected in ${relPath}: ${mojibakeMatches.slice(0, 5)}`);
    return false;
  }

  try {
    const data = JSON.parse(content);
    return data;
  } catch (err) {
    console.error(`FAILED: Invalid JSON in ${relPath}: ${err.message}`);
    return false;
  }
}

function main() {
  console.log('=== 1. JSON Roundtrip & Mojibake Check (All 8 Locales) ===');
  let allOk = true;
  const loadedData = {};

  for (const relPath of FILES) {
    const data = checkFile(relPath);
    if (data === false) {
      allOk = false;
    } else if (data !== 'SKIP') {
      loadedData[relPath] = data;
      console.log(`PASS: ${relPath} - Valid JSON, 0 mojibake characters`);
    }
  }

  if (!allOk) {
    process.exit(1);
  }

  console.log('\n=== 2. Tender Key Presence Assertions ===');
  // Website keys (always present in website repo)
  for (const lang of ['en', 'ar', 'zh']) {
    const p = `mintcom-website/src/i18n/locales/${lang}.json`;
    const d = loadedData[p];
    if (!d?.orders?.payment?.splitCount) throw new Error(`Missing orders.payment.splitCount in ${p}`);
    if (!d?.orders?.exportFields?.paymentBreakdown) throw new Error(`Missing orders.exportFields.paymentBreakdown in ${p}`);
    if (!d?.orders?.details?.refundedTenders) throw new Error(`Missing orders.details.refundedTenders in ${p}`);
    console.log(`PASS: ${p} has splitCount, paymentBreakdown, refundedTenders`);
  }

  // POS keys (validated when present in workspace)
  for (const lang of ['en', 'ar']) {
    const p = `mintcom-pos/src/i18n/locales/${lang}.json`;
    const d = loadedData[p];
    if (d) {
      if (!d.reports?.splitCount) throw new Error(`Missing reports.splitCount in ${p}`);
      if (!d.receipt?.refundedTenders) throw new Error(`Missing receipt.refundedTenders in ${p}`);
      console.log(`PASS: ${p} has reports.splitCount, receipt.refundedTenders`);
    }
  }

  // Admin portal keys (validated when present in workspace)
  for (const lang of ['en', 'ar', 'zh']) {
    const p = `mintcom-admin-portal/src/translations/${lang}.json`;
    const d = loadedData[p];
    if (d) {
      if (!d.orders?.payment?.splitCount) throw new Error(`Missing orders.payment.splitCount in ${p}`);
      if (!d.orders?.exportFields?.paymentBreakdown) throw new Error(`Missing orders.exportFields.paymentBreakdown in ${p}`);
      if (!d.orders?.details?.refundedTenders) throw new Error(`Missing orders.details.refundedTenders in ${p}`);
      if (!d.receipt?.refundedTenders) throw new Error(`Missing receipt.refundedTenders in ${p}`);
      console.log(`PASS: ${p} has splitCount, paymentBreakdown, refundedTenders`);
    }
  }

  console.log('\nALL CHECKED LOCALE FILES VALIDATED SUCCESSFULLY (0 mojibake, all keys present)!');
}

main();
