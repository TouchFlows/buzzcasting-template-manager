export function objSizeMegaBytes(obj: any) {
    return objSizeBytes(obj) / (1024 * 1024);
}

export default function objSizeKiloBytes(obj: any) {
    return objSizeBytes(obj) / 1024;
}

export function objSizeBytes(obj: any) {
    return new TextEncoder().encode(JSON.stringify(obj)).length;
}