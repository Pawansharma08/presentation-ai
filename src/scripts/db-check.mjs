import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
(async () => {
  try {
    await db.$connect();
    const [{ current_database }] = await db.$queryRawUnsafe(`SELECT current_database() AS current_database`);
    const schemas = await db.$queryRawUnsafe(`SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`);
    const tables = await db.$queryRawUnsafe(`SELECT table_schema, table_name FROM information_schema.tables ORDER BY table_schema, table_name`);
    console.log('current_database:', current_database);
    console.log('schemas:', schemas.map(r => r.schema_name));
    console.log('tables_in_public:', tables.filter(t => t.table_schema === 'public').map(t => t.table_name));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
})();
