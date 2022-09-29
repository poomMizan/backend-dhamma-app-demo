/* eslint-disable prettier/prettier */
import * as path from 'path';
export const addContentFileExtFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: any, acceptFile: boolean) => void,
): void => {
  const ext = path.extname(file.originalname);
  const fieldName = file.fieldname;
  // เปลี่ยนเป็น switch ก็ได้
  if (fieldName === 'photo') {
    if (!ext.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      req.fileExtensionError = `อนุญาตเฉพาะไฟล์ที่มีนามสกุล .jpg .jpeg .png .gif เท่านั้น ไฟล์ที่ท่านอัปโหลดมามีนามสกุล .${ext}`;
      // console.log('filter photo problem');
      return callback(null, false);
    }
    // console.log('filter photo pass');
    callback(null, true);
  }
  if (fieldName === 'media') {
    if (!ext.toLowerCase().match(/\.(wav|mp4)$/)) {
      // console.log('filter media problem');
      req.fileExtensionError = `อนุญาตเฉพาะไฟล์ที่มีนามสกุล .wav และ .mp4 เท่านั้น. ไฟล์ที่ท่านอัปโหลดมามีนามสกุล .${ext}`;
      return callback(null, false);
    }
    // console.log('filter media pass');
    callback(null, true);
  }
};
