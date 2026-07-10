const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');

// Helper to recursively get files
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

if (!fs.existsSync(distDir)) {
  console.error(`Dist directory does not exist: ${distDir}. Did you run build?`);
  process.exit(1);
}

const htmlFiles = getFiles(distDir).filter(f => f.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files to audit.`);

const brokenLinks = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const relativePath = path.relative(distDir, file);
  
  // A regex to extract hrefs
  const hrefRegex = /<a\s+[^>]*href=["']([^"']*)["']/gi;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    checkLink(file, relativePath, 'href', href);
  }

  // A regex to extract img src
  const srcRegex = /<img\s+[^>]*src=["']([^"']*)["']/gi;
  while ((match = srcRegex.exec(content)) !== null) {
    const src = match[1];
    checkLink(file, relativePath, 'img src', src);
  }

  // A regex to extract stylesheet hrefs
  const linkRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["']/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    checkLink(file, relativePath, 'link href', href);
  }
});

function checkLink(sourceFile, sourceRelPath, type, url) {
  // Ignore empty links or hash-only links
  if (!url || url.startsWith('#')) return;
  
  // Ignore external links
  if (url.startsWith('http://') || url.startsWith('https://')) return;
  
  // Ignore mailto links
  if (url.startsWith('mailto:')) {
    const email = url.replace('mailto:', '').split('?')[0];
    if (!email || !email.includes('@')) {
      brokenLinks.push({ file: sourceRelPath, type, url, reason: 'Invalid mailto format' });
    }
    return;
  }
  
  // Check internal paths
  // Remove hash or query params
  const cleanUrl = url.split('#')[0].split('?')[0];
  if (!cleanUrl || cleanUrl === '') return;

  // Resolve cleanUrl to physical file path in dist/
  let targetPath;
  if (cleanUrl.startsWith('/')) {
    targetPath = path.join(distDir, cleanUrl);
  } else {
    // Relative link
    targetPath = path.resolve(path.dirname(sourceFile), cleanUrl);
  }

  // Check if targetPath exists
  // If targetPath is a directory or maps to a directory, check for directory/index.html
  let exists = false;
  let triedPaths = [targetPath];

  try {
    if (fs.existsSync(targetPath)) {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        const indexHtml = path.join(targetPath, 'index.html');
        triedPaths.push(indexHtml);
        if (fs.existsSync(indexHtml)) {
          exists = true;
        }
      } else {
        exists = true;
      }
    } else {
      // If it doesn't exist, check if it's a directory link without trailing slash or index.html
      // e.g. /about might resolve to dist/about/index.html
      // Astro generates directory routes
      const withIndex = path.join(targetPath, 'index.html');
      triedPaths.push(withIndex);
      if (fs.existsSync(withIndex)) {
        exists = true;
      }
    }
  } catch (e) {
    exists = false;
  }

  if (!exists) {
    brokenLinks.push({
      file: sourceRelPath,
      type,
      url,
      triedPaths: triedPaths.map(p => path.relative(distDir, p))
    });
  }
}

console.log('Audit results:');
if (brokenLinks.length === 0) {
  console.log('All internal links, images, and stylesheets resolved correctly!');
  process.exit(0);
} else {
  console.error(`Found ${brokenLinks.length} broken references:`);
  console.error(JSON.stringify(brokenLinks, null, 2));
  process.exit(1);
}
