const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Pinned so a jscpd release cannot silently change what the threshold means.
const JSCPD_PKG = 'jscpd@5.0.16';

// Ratchet threshold (fails if duplication percentage exceeds it).
// Current: 3.19%. Lower this as duplication drops — never raise it.
const MAX_THRESHOLD = parseFloat(process.env.JSCPD_MAX_THRESHOLD || '3.29');

console.log(`Running jscpd duplication check for website (Max allowed: ${MAX_THRESHOLD}%)...`);
const outputDir = path.join(__dirname, '../.jscpd-gate');

try {
  execSync(`npx --yes ${JSCPD_PKG} src/ --reporters json --output "${outputDir}" 2>/dev/null`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
  });
} catch (_e) {
  // jscpd exits with non-zero when duplicates are found, which is expected
}

const reportFile = path.join(outputDir, 'jscpd-report.json');
if (!fs.existsSync(reportFile)) {
  console.error('Error: jscpd report was not generated.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const percentage = parseFloat(report.statistics.total.percentage);
const duplicatedLines = report.statistics.total.duplicatedLines;
const clones = report.statistics.total.clones;

try {
  fs.rmSync(outputDir, { recursive: true, force: true });
} catch (_e) {}

console.log(`Duplication results: ${percentage}% (${duplicatedLines} lines across ${clones} clones)`);

if (percentage > MAX_THRESHOLD) {
  console.error(`❌ FAILED: Duplication ${percentage}% exceeds the maximum threshold of ${MAX_THRESHOLD}%`);
  process.exit(1);
}

console.log(`✅ PASSED: Duplication ${percentage}% is within the allowed limit (${MAX_THRESHOLD}%)`);
