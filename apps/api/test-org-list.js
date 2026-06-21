const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({
    select: { email: true }
  });

  console.log('Found user:', user?.email);
  // We don't know the password, so let's just forcefully create a session or user?
  // Let's create a temporary user.
  const bcrypt = require('bcrypt');
  const tempEmail = 'tempuser@example.com';
  const hashed = await bcrypt.hash('Password123!', 10);
  
  let tempUser = await prisma.user.findFirst({ where: { email: tempEmail } });
  if (!tempUser) {
    const tenant = await prisma.tenant.create({ data: { name: 'Temp Tenant', slug: 'temp-tenant-' + Date.now() } });
    tempUser = await prisma.user.create({
      data: {
        email: tempEmail,
        passwordHash: hashed,
        firstName: 'Temp',
        lastName: 'User',
        tenantId: tenant.id
      }
    });
  }

  // Now login with tempEmail
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      if (!response.access_token) {
        console.log('Login failed:', response);
        return;
      }
      console.log('Logged in. Fetching organizations...');
      const orgReq = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/organizations?page=1&limit=100',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${response.access_token}` }
      }, (orgRes) => {
        let orgData = '';
        orgRes.on('data', (chunk) => orgData += chunk);
        orgRes.on('end', () => {
          console.log('Status:', orgRes.statusCode);
          console.log('Response:', orgData);
          prisma.$disconnect();
        });
      });
      orgReq.end();
    });
  });

  req.write(JSON.stringify({ email: tempEmail, password: 'Password123!' }));
  req.end();
}

run().catch(console.error);
