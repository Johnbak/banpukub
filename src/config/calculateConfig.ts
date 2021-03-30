import _ from 'lodash';
import {roundUpNumber} from '../utils/calculate';
export enum CALCULATE {
  ONE_FILE_POWER_GEN='calculateOneFilePowerGen',
  ONE_FILE_RADIATION='calculateOneFileRadiation',
  MULTI_FILE_DUP_NAME_POWER_GEN='calculateMultiFileDupPowerGen',
  MULTI_FILE_DUP_NAME_RADIATION='calculateMultiFileDupRadiation',
  MULTI_FILE_DIF_NAME_POWER_GEN='calculateMultiFileDifPowerGen',
  MULTI_FILE_DIF_NAME_RADIATION='calculateMultiFileDifRadiation',
  MULTI_FILE_DIF_NAME_2000_RADIATION='calculateMultiFileDifRadiationDivide2000',
}
const sumPowerGen = (list:any[]):number => {
  return _.sumBy(list, (value)=>value['powerGeneration'])
}
const sumRadiation = (list:any[]):number => {
  return _.sumBy(list, (value)=>value['radiation'])
}
const calculatePowerGeneration = (list:any[]):number => {
  return roundUpNumber(sumPowerGen(list)/list.length);
}
const calculateRadiation = (list:any[]) :number=> {
  return roundUpNumber(sumRadiation(list)/list.length);
}
const calculatePowerGenMultiFileDiffName = (list:any[]):number => {
  return roundUpNumber(sumPowerGen(list))
}
const calculatePowerGenMultiFileDupName = (list:any[]):number => {
  return roundUpNumber(sumPowerGen(list))
}
const calculateRadiationMultiFileDupName = (list:any[]):number => {
  const size:number = list.length
  return roundUpNumber(sumRadiation(list)/size/1000)
}
const calculateRadiationMultiFileDiffName = (list:any[]):number => {
  const size:number = list.length
  return roundUpNumber(sumRadiation(list)/size)
}
const calculateRadiationMultiFileDiffNameDivide2000 = (list:any[]):number => {
  return roundUpNumber(sumRadiation(list)/2000)
}


const calculate = (key:string='', list:any[]) :number => {
  let result:number = 0;
  switch (key) {
    case 'calculateOneFilePowerGen':
      result = calculatePowerGeneration(list)
      break;
    case 'calculateOneFileRadiation':
      result = calculateRadiation(list)
      break;
    case 'calculateMultiFileDupPowerGen':
      result =  calculatePowerGenMultiFileDupName(list);
      break;
    case 'calculateMultiFileDupRadiation':
      result =  calculateRadiationMultiFileDupName(list);
      break;
    case 'calculateMultiFileDifPowerGen':
      result =  calculatePowerGenMultiFileDiffName(list)
      break;
    case 'calculateMultiFileDifRadiation':
      result =  calculateRadiationMultiFileDiffName(list);
      break;
    case 'calculateMultiFileDifRadiationDivide2000':
      result =  calculateRadiationMultiFileDiffNameDivide2000(list);
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