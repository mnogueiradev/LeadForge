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
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // The exact string we found in grep
  const target = "{ provide: PrismaClient, useFactory: () => { if (!(globalThis as any).prisma) (globalThis as any).prisma = new PrismaClient({ log: ['error', 'warn'] }); return (globalThis as any).prisma; } }";
  
  if (content.includes(target)) {
    // Calculate relative path from this file to src/lib/prisma
    // file is like apps\api\src\modules\auth\auth.module.ts
    // src/lib/prisma is apps\api\src\lib\prisma
    const dir = path.dirname(file);
    const libDir = path.join(process.cwd(), 'apps', 'api', 'src', 'lib', 'prisma');
    
    let relativePath = path.relative(dir, libDir).replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    // Replace the provider
    const replacement = `{ provide: PrismaClient, useFactory: async () => { const { prisma } = await import('${relativePath}'); return prisma; } }`;
    content = content.replace(target, replacement);
    
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log(`Refactored ${modifiedCount} files.`);
