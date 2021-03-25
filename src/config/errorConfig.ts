
export const messageFileInvalid = 'File Invalid';
export const messageConfigNotFound = 'Config Not found';

export const errorFileInValid = (message:string='') => {
  return new Error(message)
}