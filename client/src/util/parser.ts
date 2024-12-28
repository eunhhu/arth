export function parseTimestampToDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatSeconds(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds.toFixed(1)}s`);

    return parts.join(" ");
}

export function formatBytes(bytes: number): string {
    if (bytes < 0) throw new Error("Byte value cannot be negative.");

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    let unitIndex = 0;

    while (bytes >= 1000 && unitIndex < units.length - 1) {
        bytes /= 1024;
        unitIndex++;
    }

    if (unitIndex === 0) {
        return `${bytes}${units[unitIndex]}`;
    }

    return `${bytes.toFixed(2)}${units[unitIndex]}`;
}
