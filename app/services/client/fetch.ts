export async function fetchPost(input: RequestInfo | URL, data: any) {
    return await fetch(input, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: typeof data === "string" ? data : JSON.stringify(data),
    });
}

export async function fetchPut(input: RequestInfo | URL, data: any) {
    return await fetch(input, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: typeof data === "string" ? data : JSON.stringify(data),
    });
}

export async function fetchDelete(input: RequestInfo | URL) {
    return await fetch(input, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
}