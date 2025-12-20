import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { AdapterAccountType } from "next-auth/adapters";

export const users = sqliteTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
    image: text("image"),
});

export const accounts = sqliteTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ]);

export const sessions = sqliteTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    },
    (verificationToken) => [
        primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    ]);

export const authenticators = sqliteTable(
    "authenticator",
    {
        credentialID: text("credentialID").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        providerAccountId: text("providerAccountId").notNull(),
        credentialPublicKey: text("credentialPublicKey").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credentialDeviceType").notNull(),
        credentialBackedUp: integer("credentialBackedUp", {
            mode: "boolean",
        }).notNull(),
        transports: text("transports"),
    },
    (authenticator) => [
        primaryKey({
            columns: [authenticator.userId, authenticator.credentialID],
        }),
    ]);

export const projects = sqliteTable("projects", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    lastRequestedAt: integer("last_requested_at").notNull(),

    title: text("title").notNull(),
    description: text("description"),
});

export const projectDocuments = sqliteTable("project_documents", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),

    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    lastRequestedAt: integer("last_requested_at").notNull(),

    title: text("title").notNull(),
    content: text("content").notNull(),
});

export const projectBoards = sqliteTable("project_boards", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),

    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    lastRequestedAt: integer("last_requested_at").notNull(),

    title: text("title").notNull(),
});

export const projectBoardSections = sqliteTable("project_board_sections", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    parentId: text("board_id")
        .notNull()
        .references(() => projectBoards.id, { onDelete: "cascade" }),

    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),

    title: text("title").notNull(),
    position: integer("position").notNull(),
});

export const projectBoardItems = sqliteTable("project_board_items", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    parentId: text("section_id")
        .notNull()
        .references(() => projectBoardSections.id, { onDelete: "cascade" }),

    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    lastRequestedAt: integer("last_requested_at").notNull(),

    title: text("title").notNull(),
    position: integer("position").notNull(),
    isDone: integer("is_done", { mode: "boolean" }).notNull().default(false),
    description: text("description"),
});

export const projectBoardCheckItems = sqliteTable("project_board_check_items", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    parentId: text("item_id")
        .notNull()
        .references(() => projectBoardItems.id, { onDelete: "cascade" }),

    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),

    title: text("title").notNull(),
    position: integer("position").notNull(),
    isDone: integer("is_done", { mode: "boolean" }).notNull().default(false),
});

export const dataImages = sqliteTable("data_images", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),

    uploadedAt: integer("uploaded_at").notNull(),

    title: text("title").notNull(),
    imageData: text("image_data").notNull(),
});

export const projectDocumentsRelations = relations(projectDocuments, ({ one }) => ({
    project: one(projects, {
        fields: [projectDocuments.projectId],
        references: [projects.id],
    }),
}));

export const projectBoardsRelations = relations(projectBoards, ({ one, many }) => ({
    project: one(projects, {
        fields: [projectBoards.projectId],
        references: [projects.id],
    }),
    sections: many(projectBoardSections),
}));

export const projectBoardSectionsRelations = relations(projectBoardSections, ({ one, many }) => ({
    board: one(projectBoards, {
        fields: [projectBoardSections.parentId],
        references: [projectBoards.id],
    }),
    items: many(projectBoardItems),
}));

export const projectBoardItemsRelations = relations(projectBoardItems, ({ one, many }) => ({
    section: one(projectBoardSections, {
        fields: [projectBoardItems.parentId],
        references: [projectBoardSections.id],
    }),
    checkItems: many(projectBoardCheckItems),
}));

export const projectBoardCheckItemsRelations = relations(projectBoardCheckItems, ({ one }) => ({
    item: one(projectBoardItems, {
        fields: [projectBoardCheckItems.parentId],
        references: [projectBoardItems.id],
    }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
    documents: many(projectDocuments),
    boards: many(projectBoards),
}));