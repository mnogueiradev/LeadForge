const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.module.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src/modules');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the bad relative path
  if (content.includes('../../../apps/api/src/lib/prisma')) {
    // Determine depth based on the file path
    // e.g. src\modules\auth\auth.module.ts (depth 2 inside src/modules) -> ../../lib/prisma
    // src\modules\pipeline-movements\pipeline-movements.module.ts -> ../../lib/prisma
    const rel = path.relative(path.dirname(file), path.join(process.cwd(), 'src', 'lib', 'prisma')).replace(/\\/g, '/');
    
    content = content.replace('../../../apps/api/src/lib/prisma', rel);
    fs.writeFileSync(file, content, 'utf8');
  }
});
