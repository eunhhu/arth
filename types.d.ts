interface FileInfo {
    path: string;
    name: string;
    size: number;
    isDirectory: boolean;
    created: number;
    modified: number;
}

interface IAuth {
    label: string;
    pw: string;
    perms: string[];
}