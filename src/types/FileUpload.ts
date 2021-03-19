export type FileUpload  = {
  readonly  name:string,
  readonly  data?:ArrayBuffer,
  readonly  size:number,
  encoding:string,
  tempFilePath:string,
  truncated:boolean,
  readonly mimetype:string,
  md5:string,
  mv:Function
}
