const { PrismaClient } = require('@prisma/client');
(async () => {
  const db = new PrismaClient();
  try {
    await db.$connect();
    /** @type {{ current_database: string }[]} */
    const dbNameRows = await db.$queryRawUnsafe(`SELECT current_database() AS current_database`);
    const firstDbRow = Array.isArray(dbNameRows) ? dbNameRows[0] : undefined;
    if (!firstDbRow || typeof firstDbRow.current_database !== 'string') {
      throw new Error('No database name returned from current_database()');
    }
    const { current_database } = firstDbRow;
    /** @type {{ schema_name: string }[]} */
    const schemas = await db.$queryRawUnsafe(`SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`);
    /** @type {{ table_schema: string, table_name: string }[]} */
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
