import { CONFIG } from "../config/app-constant.ts";
import { Md5 } from "./md5.ts";

export const getBookCoverUrl = ({ bookId, maxChar = 4, size = ['xs', 'lg'] }: { bookId: number, maxChar?: number, size?: string[] }) => {
    const dirName = Math.floor(bookId / 1000);
    const fileId = bookId.toString().padStart(maxChar, '0');

    const urls: Record<string, string> = {};
    size.forEach((s: string) => {
        urls[s] = `${CONFIG.CLOUD_URL}/book/images/${dirName}/${s}/${fileId}/${fileId}_0000_${s}.jpg`;
    })
    return urls;
}

export const getBookSamplePagesUrl = ({ bookId, maxChar = 4, size = ['xs', 'lg'] }: { bookId: number, maxChar?: number, size?: string[] }) => {
    const dirName = Math.floor(bookId / 1000);
    const fileId = bookId.toString().padStart(maxChar, '0');

    const urls: Record<string, string> = {};
    size.forEach((s) => {
        urls[s] = `${CONFIG.CLOUD_URL}/book/images/${dirName}/${s}/${fileId}/${fileId}_`;
    })
    return urls;
}

export const getBookPdfUrl = ({ bookId, maxChar = 4 }: { bookId: number, maxChar?: number }) => {
    const dirName = Math.floor(bookId / 1000);
    return `${CONFIG.CLOUD_URL}/book/pdf/${dirName}/${createAutoBookName(bookId, maxChar)}.pdf`;
}

export const createAutoBookName = (bookId: number, maxChar = 4) => {
    const fileId = bookId.toString().padStart(maxChar, '0');
    const md5Char = Md5.hashStr(bookId.toString());

    if (md5Char.length > maxChar) {
        return (`${fileId}_${md5Char.slice(0, maxChar)}`);
    }
    return ('');
}