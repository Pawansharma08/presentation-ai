import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import "../../../scripts/set-database-url";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Basic DB ping
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", message: "Database is healthy!" });
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", message: "Database not reachable", error: e?.message },
      { status: 500 }
    );
  }
}
