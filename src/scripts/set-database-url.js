function encodePwd(pwd = "") {
  try {
    return encodeURIComponent(pwd);
  } catch {
    return pwd;
  }
}

function sanitize(value) {
  return (value ?? "").toString().trim().replace(/^\"|\"$/g, "").replace(/^'|'$/g, "");
}

const requiredKeys = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME"];

// Do not override if DATABASE_URL already exists
if (!process.env.DATABASE_URL && requiredKeys.every((k) => process.env[k])) {
  const user = sanitize(process.env.DB_USER);
  const password = sanitize(process.env.DB_PASSWORD);
  const host = sanitize(process.env.DB_HOST);
  const portRaw = sanitize(process.env.DB_PORT);
  const dbName = sanitize(process.env.DB_NAME);
  const schema = sanitize(process.env.DB_SCHEMA) || "public";

  // Validate port strictly; if invalid, omit the port segment entirely
  const port = /^\d+$/.test(portRaw) ? portRaw : "";
  const hostPort = port ? `${host}:${port}` : host;

  if (!port) {
    console.warn(
      "[DB URL Builder] DB_PORT is missing/invalid; proceeding without explicit port. Got:",
      JSON.stringify(portRaw),
    );
  }

  const encodedPwd = encodePwd(password);
  const url = `postgresql://${user}:${encodedPwd}@${hostPort}/${dbName}?schema=${schema}&sslmode=require`;

  // Basic sanity check: ensure no trailing '@' or '://:' patterns
  if (!user || !password || !host || !dbName) {
    console.error("[DB URL Builder] Missing required DB fields; skipping DATABASE_URL set.");
  } else {
    // Mask password for logs
    const masked = `postgresql://${user}:******@${hostPort}/${dbName}?schema=${schema}&sslmode=require`;
    console.log("[DB URL Builder] Using DATABASE_URL:", masked);
    process.env.DATABASE_URL = url;
  }
}
