const { defineConfig } = require("cypress");
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        fileExists(filePath) {
          try {
            return fs.existsSync(filePath);
          } catch (error) {
            return false;
          }
        },
        glob(pattern) {
          try {
            const glob = require('glob');
            return glob.sync(pattern);
          } catch (error) {
            // Fallback to simple directory listing if glob fails
            try {
              const dir = path.dirname(pattern);
              const baseName = path.basename(pattern).replace('*', '');
              const files = fs.readdirSync(dir);
              return files
                .filter(file => file.includes(baseName))
                .map(file => path.join(dir, file));
            } catch (fallbackError) {
              return [];
            }
          }
        }
      });
    },
  },
});
