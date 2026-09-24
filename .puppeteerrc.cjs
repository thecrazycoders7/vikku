const { join } = require('path')

// Keep Chromium inside the project so the copy downloaded during `npm install`
// is still found during the build step (Vercel's default ~/.cache/puppeteer
// does not survive between install and build).
module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
}
