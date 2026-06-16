const fs = require('fs');
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
  content = content.replace(/useFactory: \(\) => new PrismaClient\(\)/g, "useFactory: () => new PrismaClient({ log: ['error', 'warn'] })");
  fs.writeFileSync(file, content);
}
console.log('Fixed PrismaClient options.');
