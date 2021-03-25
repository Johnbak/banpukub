
export const roundUpNumber = (num:number) => {
  return Math.round(num * 100) / 100;
}
export const sum = (list:any[], key:string) => {
  const sum =  list
    .map((v:any)=> v[key])
    .reduce((a:any, b:any) => a+b, 0)

  return sum
}
export const sumAVG = (list:any[], key:string) => {
  const sum =  list
     .map((v:any)=> v[key])
     .reduce((a:any, b:any) => a+b, 0)

  return sum /list.length
}