/* eslint-disable prettier/prettier */
import * as path from 'path';
export const imageFileFilter = (
  request: any,
  file: Express.Multer.File,
  callback: (arg0: any, arg1: boolean) => void,
) => {
  const fileSize = parseInt(request.headers['content-length']);
  const ext = path.extname(file.originalname);
  console.log(ext);
  if (!ext.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    console.log('Only image files are allowed');
    request.imageFileValidationError = 'Only image files are allowed';
    return callback(null, false);
  }
  if (fileSize > 1000000) {
    console.log('Image file size limit is 1000 kb');
    request.imageFileValidationError = 'Image file size limit is 1000 kb';
    return callback(null, false);
  }
  callback(null, true);
};
