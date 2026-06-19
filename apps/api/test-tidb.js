const { connect } = require('@tidbcloud/serverless');

// Usa a mesma variável de ambiente
const url = process.env.DATABASE_URL || "mysql://Bh3ULP3LZKbGgiH.root:KupBhL9xE4ck9fJW@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/leadforge?sslaccept=strict";

async function testConnection() {
  console.log("Testing TiDB Serverless connection using @tidbcloud/serverless...");
  try {
    const conn = connect({ url });
    const result = await conn.execute("SELECT 1 as val");
    console.log("Connection successful! Result:", result);
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();
