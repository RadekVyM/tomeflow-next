"use server";

import { revalidatePath } from "next/cache";
import { eq, not } from "drizzle-orm";

import { db } from "@/db";

export async function addTodo(formData: FormData) {
    const description = formData.get("description") as string;

    revalidatePath("/");
}

export async function removeTodoAction(id: number) {
    revalidatePath("/");
}

export async function toggleTodoAction(id: number) {
    revalidatePath("/");
}
