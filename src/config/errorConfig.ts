
export const messageFileInvalid = 'Invalid file upload';
export const messageConfigNotFound = 'Config Not found';
export const messageTypeFileInValid = "Invalid type file";
export const messageNoRecord = "File No record";
export const messageRequireMultiFileUpload = "Require 2 file to upload"; // TODO: case upload 2 file!
export const messageRequireFile = "Require 1 file";

export const errorFileInValid = (message:string='') => {
  return new Error(message)
}