export interface UteFileOptions {
    quality?: number;
    maxHeight?: number;
    maxWidth?: number;
    checkOrientation?: boolean;
    multiple?: boolean;
    uniqName?: boolean;
    full?: boolean;
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
    videos: ["webm", "avi", "mkv", "mp4"],
    files: ["zip", "rar", "psd", "ai", "back", "json", "xml", "html", "file"],
    imageIgnor: ["svg", "ico"],
};
