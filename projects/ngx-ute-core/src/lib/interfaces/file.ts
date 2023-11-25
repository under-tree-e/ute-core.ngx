export interface UteFileOptions {
    quality?: number;
    maxHeight?: number;
    maxWidth?: number;
    checkOrientation?: boolean;
    multiple?: boolean;
    uniqName?: boolean;
}

export interface UteFileResult {
    uid: string;
    type: string;
    name: string;
    ex: string;
    base64: string;
}

export const UteFileFormats = {
    images: ["bmp", "gif", "ico", "jpeg", "jpg", "svg", "png", "webp", "tga"],
    docs: ["txt", "pdf", "doc", "rtf", "docx", "xls", "xlsx", "odt"],
    files: ["zip", "rar", "back", "json", "xml", "html", "file"],
};
