export async function downloadExportedData(apiUrl: string, fileName: string) {
    const exportedProject = await fetch(apiUrl)
        .then((response) => response.text());

    const blob = new Blob([exportedProject], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.json`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}