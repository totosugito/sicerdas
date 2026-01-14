import { APP_CONFIG } from "@/constants/config";
import { Md5 } from "@/lib/md5";

export const createAutoBookName = (bookId: number, maxChar = 4) => {
  const dirName = Math.floor(bookId / 1000);
  const fileId = bookId.toString().padStart(maxChar, '0');
  const md5Char = Md5.hashStr(bookId.toString());

  if (md5Char.length > maxChar) {
    return (`${dirName}/${fileId}_${md5Char.slice(0, maxChar)}`);
  }
  return ('');
}

export const getBookPdf = (bookId: number, maxChar = 4, extension = '.pdf') => {
  return (`${APP_CONFIG.cloud}/bse/perpustakaan/${createAutoBookName(bookId, maxChar)}${extension}`);
}

export const getBookCover = (bookId: number, fileType = 'cover', maxChar = 4, extension = '.jpg') => {
  return (`${APP_CONFIG.cloud}/bse/perpustakaan/cover/${createAutoBookName(bookId, maxChar)}_${fileType}${extension}`);
}

export const getBookPageList = (bookId: number, maxChar = 4, totalPages = 5) => {
  const dirName = Math.floor(bookId / 1000);
  const fileId = bookId.toString().padStart(maxChar, '0');

  let baseUrl = `${APP_CONFIG.cloud}/bse/perpustakaan/images/${dirName}`;
  let pages = [];
  for (let i = 0; i < totalPages; i++) {
    const id_ = (i + 1).toString().padStart(maxChar, '0');
    pages.push({
      thumb: `${baseUrl}/${fileId}_${id_}_xs.jpg`,
      image: `${baseUrl}/${fileId}_${id_}_lg.jpg`
    });
  }
  return (pages);
}