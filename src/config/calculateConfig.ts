enum CALCULATE {
  ONE_FILE_POWER_GEN='calculateOneFilePowerGen',
  ONE_FILE_RADIATION='calculateOneFileRadiation',
}
const calculateRadiationOneFileCaseHour = (num:number) => {
  return num/1000;
}

const calculateRadiationMultiFileCaseMin = (list:any[]) => {
  const totalRadiation = list.length;
  return list.reduce((a,b) => a+b,0)/totalRadiation/12/1000;
}

const calculateRadiationMultiFileDiffNameCaseHours = (list:any[]) => {
  const totalRadiation = list.length;
  return list.reduce((a,b) => a+b,0)/totalRadiation
}

const calculateRadiationMultiFileDiffNameCaseMin = (list:any[]) => {
  return list.reduce((a,b) => a+b,0)/2000
}

const calculate = (key:string='', list:any[]) => {
  let result:number = 0;
  switch (key) {
    case 'calculateOneFilePowerGen':
      result =  0;
      break;
    case 'calculateOneFileRadiation':
      result =  0;
      break;
    default:
      result = 0;
      break;
  }
  return result;
}

export {
  calculate
}