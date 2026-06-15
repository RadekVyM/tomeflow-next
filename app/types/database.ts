import { db } from "@/db";
import { LibSQLDatabase } from "drizzle-orm/libsql";

export type Schema = typeof import("@/db/schema"); 
// Define a flexible type that accepts the main db or a transaction block client
export type DbClient = LibSQLDatabase<Schema> | Parameters<Parameters<typeof db.transaction>[0]>[0];