const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const docsDir = path.join(baseDir, 'docs/engineering-communication');

let errorCount = 0;

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Exclude research snapshot directory from formatting validation
      if (filePath.replace(/\\/g, '/').endsWith('v2/research/rkf-reference/docs')) {
        continue;
      }
      walk(filePath, callback);
    } else if (stat.isFile() && file.endsWith('.md')) {
      callback(filePath);
    }
  }
}

function lintMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(baseDir, filePath).replace(/\\/g, '/');
  console.log(`Linting file: ${relPath}`);

  let h1Count = 0;
  let lastHeadingLevel = 0;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const cleanLine = line.replace(/\r$/, '');

    // Check Heading structure
    const headingMatch = cleanLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      if (level === 1) h1Count++;

      // Heading level skip check (e.g. h1 to h3 skip)
      if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
        console.error(`[ERR] Heading level skip on ${relPath}:${lineNum}: h${lastHeadingLevel} to h${level}`);
        errorCount++;
      }
      lastHeadingLevel = level;
    }
  });

  // Check Single H1 per document (BECC standard)
  if (h1Count > 1) {
    console.error(`[ERR] Multiple H1 headings found in ${relPath} (found ${h1Count})`);
    errorCount++;
  }
}

console.log('Linting markdown documentation...');
walk(docsDir, lintMarkdown);

if (errorCount > 0) {
  console.error(`\x1b[31mMarkdown linting failed with ${errorCount} errors.\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32mMarkdown linting passed successfully!\x1b[0m');
  process.exit(0);
}
