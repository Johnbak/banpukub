
const calculateRadiationOneFileCaseHour = (num:number) => {
  return num/1000;
}

const calculateRadiationMultiFileCaseMin = (list:[]) => {
  const totalRadiation = list.length;
  return list.reduce((a,b) => a+b,0)/totalRadiation/12/1000;
}

const calculateRadiationMultiFileDiffNameCaseHours = (list:[]) => {
  const totalRadiation = list.length;
  return list.reduce((a,b) => a+b,0)/totalRadiation
}

const calculateRadiationMultiFileDiffNameCaseMin = (list:[]) => {
  return list.reduce((a,b) => a+b,0)/2000
}