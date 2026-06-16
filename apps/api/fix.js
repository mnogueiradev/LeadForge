const fs = require('fs');
const path = require('path');
const files = [
'src/modules/activities/activities.module.ts',
'src/modules/audit/audit.module.ts',
'src/modules/auth/auth.module.ts',
'src/modules/calendar/calendar.module.ts',
'src/modules/contacts/contacts.module.ts',
'src/modules/custom-fields/custom-fields.module.ts',
'src/modules/identity-hardening/identity-hardening.module.ts',
'src/modules/invitations/invitations.module.ts',
'src/modules/leads/leads.module.ts',
'src/modules/notes/notes.module.ts',
'src/modules/organizations/organizations.module.ts',
'src/modules/pipeline-movements/pipeline-movements.module.ts',
'src/modules/pipeline-stages/pipeline-stages.module.ts',
'src/modules/pipelines/pipelines.module.ts',
'src/modules/rbac/rbac.module.ts',
'src/modules/security-logs/security-logs.module.ts',
'src/modules/security-policies/security-policies.module.ts',
'src/modules/sessions/sessions.module.ts',
'src/modules/tags/tags.module.ts',
'src/modules/timeline/timeline.module.ts',
'src/modules/users/users.module.ts'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Extract all imports from local files
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"](\.[^'"]+)['"]/g;
  let match;
  let imports = [];
  while ((match = importRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim()).filter(Boolean);
    imports.push(...names);
  }
  
  let providers = ['{ provide: PrismaClient, useFactory: () => new PrismaClient() }'];
  let interfaces = [];
  let classes = [];
  
  for (const name of imports) {
    if (name.endsWith('Controller') || name.endsWith('Module')) continue;
    if (name.startsWith('I') && name.endsWith('Repository')) {
      interfaces.push(name);
    } else {
      classes.push(name);
    }
  }
  
  for (const iface of interfaces) {
    const impl = classes.find(c => c.endsWith('Repository') && c !== iface);
    if (impl) {
      providers.push('{ provide: ' + iface + ', useClass: ' + impl + ' }');
      classes = classes.filter(c => c !== impl);
    }
  }
  
  // Special cases: JwtStrategy, LocalStrategy, etc
  for (const cls of classes) {
    providers.push(cls);
  }
  
  // Replace the providers array
  const replacement = 'providers: [\n    ' + providers.join(',\n    ') + '\n  ]';
  content = content.replace(/providers:\s*\[[\s\S]*?\]/, replacement);
  
  fs.writeFileSync(file, content);
}
console.log('Fixed modules.');
