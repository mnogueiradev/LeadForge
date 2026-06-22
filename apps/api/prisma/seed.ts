import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Users
  { name: 'users.read', description: 'Visualizar usuários do tenant' },
  { name: 'users.create', description: 'Criar novos usuários no tenant' },
  { name: 'users.update', description: 'Editar usuários do tenant' },
  { name: 'users.delete', description: 'Excluir usuários do tenant' },

  // Roles
  { name: 'roles.read', description: 'Visualizar perfis de acesso' },
  { name: 'roles.manage', description: 'Criar, editar e excluir perfis de acesso' },

  // Contacts
  { name: 'contacts.read', description: 'Visualizar contatos' },
  { name: 'contacts.create', description: 'Criar contatos' },
  { name: 'contacts.update', description: 'Editar contatos' },
  { name: 'contacts.delete', description: 'Excluir contatos' },

  // Leads
  { name: 'leads.read', description: 'Visualizar leads' },
  { name: 'leads.create', description: 'Criar leads' },
  { name: 'leads.update', description: 'Editar leads' },
  { name: 'leads.delete', description: 'Excluir leads' },

  // Messages / Conversations
  { name: 'messages.read', description: 'Visualizar mensagens' },
  { name: 'messages.send', description: 'Enviar mensagens' },

  // Settings
  { name: 'settings.read', description: 'Visualizar configurações do tenant' },
  { name: 'settings.write', description: 'Criar ou editar configurações do tenant' },
  { name: 'settings.delete', description: 'Excluir configurações do tenant' },
  { name: 'settings.manage', description: 'Gerenciar configurações do tenant' },
  { name: 'billing.manage', description: 'Gerenciar faturamento do tenant' },
  { name: 'integrations.manage', description: 'Gerenciar integrações' },

  // Timeline
  { name: 'timeline.read_entity', description: 'Visualizar histórico (timeline)' },

  // Attachments
  { name: 'attachments.read', description: 'Visualizar anexos' },
  { name: 'attachments.write', description: 'Fazer upload e gerenciar anexos' },
];

async function main() {
  console.log('Start seeding...');

  // Seed Global Permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: {
        name: perm.name,
        description: perm.description,
      },
    });
  }

  console.log('Global permissions seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
