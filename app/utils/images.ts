export async function imageUrlToDataUrl(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();

        if (!blob.type.startsWith("image")) {
            return null;
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result?.toString() || null);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting image URL to data URL:", error);
        return null;
    }
}