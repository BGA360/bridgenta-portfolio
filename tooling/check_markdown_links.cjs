const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const docsDir = path.join(baseDir, 'docs');

let exitCode = 0;
const brokenLinks = [];

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Exclude research snapshot directory
      if (filePath.replace(/\\/g, '/').endsWith('v2/research/rkf-reference/docs')) {
        continue;
      }
      walk(filePath, callback);
    } else if (stat.isFile() && file.endsWith('.md')) {
      // Exclude research markdown files from link auditing
      if (filePath.replace(/\\/g, '/').includes('v2/research/rkf-reference')) {
        continue;
      }
      callback(filePath);
    }
  }
}

function checkMarkdownLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileDir = path.dirname(filePath);
  const relFilePath = path.relative(baseDir, filePath).replace(/\\/g, '/');

  // Match standard markdown links: [text](target)
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  let match;

  while ((match = linkPattern.exec(content)) !== null) {
    const target = match[1].trim();

    // Skip external links, mailto, anchor links
    if (
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:') ||
      target.startsWith('#')
    ) {
      continue;
    }

    // Resolve query or hash params (e.g. file.md#section)
    const cleanTarget = target.split('#')[0].split('?')[0];
    if (!cleanTarget) continue;

    // Resolve target path relative to the file being checked
    const resolvedPath = path.resolve(fileDir, cleanTarget);

    if (!fs.existsSync(resolvedPath)) {
      brokenLinks.push({
        sourceFile: relFilePath,
        linkText: match[0],
        target: target,
        resolvedPath: path.relative(baseDir, resolvedPath).replace(/\\/g, '/')
      });
    }
  }
}

console.log('Auditing relative links in markdown documentation...');
walk(docsDir, checkMarkdownLinks);

if (brokenLinks.length > 0) {
  console.error(`\x1b[31mFound ${brokenLinks.length} broken markdown links:\x1b[0m`);
  console.error(JSON.stringify(brokenLinks, null, 2));
  process.exit(1);
} else {
  console.log('\x1b[32mAll markdown relative links resolved correctly!\x1b[0m');
  process.exit(0);
}
