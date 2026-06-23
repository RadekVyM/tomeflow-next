import { db } from "@/db";
import { users } from "@/db/schema";

type User = typeof users.$inferSelect;

export async function createTestUser(
	overrides?: Partial<typeof users.$inferInsert>
): Promise<User> {
	const userId = `user-${crypto.randomUUID()}`;
	const user: typeof users.$inferInsert = {
		id: userId,
		name: "Test User",
		email: `test-${crypto.randomUUID()}@example.com`,
		emailVerified: null,
		image: null,
		...overrides,
	};

	await db.insert(users).values(user);
	const result = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, userId),
	});

	if (!result) {
		throw new Error(`Failed to create test user with id: ${userId}`);
	}

	return result;
}

export async function createManyTestUsers(count: number): Promise<Array<User>> {
	const userList = new Array<User>();
	for (let i = 0; i < count; i++) {
		const user = await createTestUser();
		userList.push(user);
	}
	return userList;
}