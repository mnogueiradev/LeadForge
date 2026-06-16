const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection('mysql://Bh3ULP3LZKbGgiH.root:KupBhL9xE4ck9fJW@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/sys?ssl={"rejectUnauthorized":true}');
  await connection.query('CREATE DATABASE IF NOT EXISTS leadforge');
  console.log('Database leadforge created');
  await connection.end();
}
run().catch(console.error);
