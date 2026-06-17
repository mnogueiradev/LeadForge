const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'src', 'modules');

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.module.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const searchStr = "globalThis.prisma";
      const replaceStr = "(globalThis as any).prisma";
      
      if (content.includes(searchStr)) {
        content = content.replace(/globalThis\.prisma/g, replaceStr);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Patched', fullPath);
      }
    }
  }
}

traverse(modulesDir);
console.log('Done patching TS any in modules.');
