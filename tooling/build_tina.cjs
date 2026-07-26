const cp = require('child_process');

console.log("=========================================");
console.log(" TinaCMS Build Integration");
console.log("=========================================");

const hasCloudConfig = process.env.NEXT_PUBLIC_TINA_CLIENT_ID && process.env.TINA_TOKEN;

if (hasCloudConfig) {
  console.log("-> Production credentials found. Building for Tina Cloud...");
  try {
    cp.execSync('npx tinacms build', { stdio: 'inherit' });
  } catch (err) {
    console.error("❌ Tina Cloud build failed:", err.message);
    process.exit(1);
  }
} else {
  console.log("-> No production credentials found. Falling back to local offline-mode build...");
  try {
    cp.execSync('npx tinacms build --local --skip-cloud-checks', { stdio: 'inherit' });
  } catch (err) {
    console.error("❌ Local Tina CMS build failed:", err.message);
    process.exit(1);
  }
}

console.log("=========================================");
