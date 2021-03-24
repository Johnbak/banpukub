import { FileUpload } from '../types/FileUpload';

const List:String[] = [
  'application/vnd.ms-excel',
  'text/csv'
];


export const CheckFileType = (file:FileUpload) => {
  try {
      // TODO: check mineType of file and accept only excel & csv
      if(List.find(value => value === file.mimetype)) {
        return file
      } else {
        const error = new Error('invalid file type');
        throw error;
      }
  } catch (e) {
    throw e
  }

}

