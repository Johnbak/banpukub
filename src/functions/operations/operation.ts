import dayjs from 'dayjs';
import _ from 'lodash';
import Value from '../../interface/operation/value';
import { calculate, CALCULATE } from '../../config/calculateConfig';

const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

export const groupMinutesToHour = (list: any[] = []) => {
  const tempList: Value[] = [];

  // TODO: loop for add key hour
  for (let i = 0; i < list.length; i++) {
  //TODO: add key hour
    list[i].hours = dayjs(list[i].dateTime).get('h');
    tempList.push(list[i]);
  }
  // TODO: list group by hours
  const listGroup = _.groupBy(tempList, 'hours');
  // TODO: order by hours
  const orderListGroup = _.orderBy(listGroup, ['hours'], 'asc');
  // TODO: convert to array

  return _.toArray(orderListGroup);
};
export const groupToAVG = (list: any[] = []) => {
  try {
    const tempValueList = list;
    let tempList: any[] = [];

    // TODO: Group by hour by start at 0:00 to 23:55
    if(list.length !== 24) {
      throw  new Error("List Value must be 24 Index")
    }

    // TODO: sum avg of radiation and power generation
    for (const item of tempValueList) {
      const initValue:any = {
        id:item[0].id,
        plantName:item[0].plantName,
        dateTime:item[0].dateTime,
        //TODO: SUM AVG OF RADIATION
        radiation:calculateRadiation(item),
        //TODO: SUM AVG OF POWER GENERATION
        powerGeneration: calculatePowerGeneration(item),
        type:item[0].type,
        hours:item[0].hours
      }
      tempList.push(initValue)
    }
    return tempList
  } catch (e) {
    throw e
  }

};
export const groupToAVGDup = (list: any[] = []) => {
  try {
    const tempValueList = list;
    let tempList: any[] = [];

    // TODO: Group by hour by start at 0:00 to 23:55
    if(list.length !== 24) {
      throw  new Error("List Value must be 24 Index")
    }

    // TODO: sum avg of radiation and power generation
    for (const item of tempValueList) {
      const initValue:any = {
        id:item[0].id,
        plantName:item[0].plantName,
        dateTime:item[0].dateTime,
        //TODO: SUM AVG OF RADIATION
        radiation:0,
        //TODO: SUM AVG OF POWER GENERATION
        powerGeneration: calculatePowerDupGeneration(item),
        type:item[0].type,
        hours:item[0].hours
      }
      tempList.push(initValue)
    }
    return tempList
  } catch (e) {
    throw e
  }

};
export const getRadiation = (list: any[]): Value[] => {
  const totalOfList = list.length;
  const maxHours = 24;
  const tempList: Value[] = [];
  if (totalOfList === 1) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue = _.groupBy(list[0], 'hours');
      tempForCalculate.push(...listValue[i.toString()]);

      const getTemp = listValue[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: calculateRadiation(tempForCalculate),
        powerGeneration: 0,
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else if (totalOfList === 2) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue1 = _.groupBy(list[0], 'hours');
      const listValue2 = _.groupBy(list[1], 'hours');
      tempForCalculate.push(...listValue1[i.toString()]);
      tempForCalculate.push(...listValue2[i.toString()]);

      const getTemp = listValue1[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: calculateRadiation(tempForCalculate),
        powerGeneration: 0,
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else {
    tempList.push({
      id: '',
      dateTime: new Date(),
      radiation: 0,
      powerGeneration: 0,
      plantName: '',
      type: ''
    });
  }
  return tempList;
};
export const getPowerGen = (list: any[]): Value[] => {
  const totalOfList = list.length;
  const maxHours = 24;
  const tempList: Value[] = [];
  if (totalOfList === 1) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue = _.groupBy(list[0], 'hours');

      tempForCalculate.push(...listValue[i.toString()]);
      const getTemp = listValue[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: 0,
        powerGeneration: calculatePowerGeneration(tempForCalculate),
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else if (totalOfList === 2) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue1 = _.groupBy(list[0], 'hours');
      const listValue2 = _.groupBy(list[1], 'hours');
      tempForCalculate.push(...listValue1[i.toString()]);
      tempForCalculate.push(...listValue2[i.toString()]);

      const getTemp = listValue1[i.toString()]

      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: 0,
        powerGeneration: calculatePowerGeneration(tempForCalculate),
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else {
    tempList.push({
      id: '',
      dateTime: new Date(),
      radiation: 0,
      powerGeneration: 0,
      plantName: '',
      type: ''
    });
  }
  return tempList;
};
export const getPowerGenMultiFileDiffName = (list: any[]): Value[] => {
  const totalOfList = list.length;
  const maxHours = 24;
  const tempList: Value[] = [];
  if (totalOfList === 1) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue = _.groupBy(list[0], 'hours');
      tempForCalculate.push(...listValue[i.toString()]);
      const getTemp = listValue[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: 0,
        powerGeneration: calculatePowerDifGeneration(tempForCalculate),
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else if (totalOfList === 2) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue1 = _.groupBy(list[0], 'hours');
      const listValue2 = _.groupBy(list[1], 'hours');
      tempForCalculate.push(...listValue1[i.toString()]);
      tempForCalculate.push(...listValue2[i.toString()]);

      const getTemp = listValue1[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: 0,
        powerGeneration: calculatePowerDifGeneration(tempForCalculate),
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else {
    tempList.push({
      id: '',
      dateTime: new Date(),
      radiation: 0,
      powerGeneration: 0,
      plantName: '',
      type: ''
    });
  }
  return tempList;
};
export const getPowerGenMultiFileDupName = (list: any[]): Value[] => {
  const totalOfList = list.length;
  const maxHours = 24;
  const tempList: Value[] = [];
  if (totalOfList === 1) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue = _.groupBy(list[0], 'hours');
      tempForCalculate.push(...listValue[i.toString()]);
      const getTemp = listValue[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: 0,
        powerGeneration: calculatePowerDupGeneration(tempForCalculate),
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else if (totalOfList === 2) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue1 = _.groupBy(list[0], 'hours');
      const listValue2 = _.groupBy(list[1], 'hours');
      tempForCalculate.push(...listValue1[i.toString()]);
      tempForCalculate.push(...listValue2[i.toString()]);

      const getTemp = listValue1[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: 0,
        powerGeneration: calculatePowerDupGeneration(tempForCalculate),
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else {
    tempList.push({
      id: '',
      dateTime: new Date(),
      radiation: 0,
      powerGeneration: 0,
      plantName: '',
      type: ''
    });
  }
  return tempList;
};
export const pushListValueToArray = (tempList: any[]): any[] => {
  try {
    let tempListResult: any[] = [];
    for (let i = 0; i < tempList.length; i++) {
      tempListResult.push(groupToAVG(tempList[i]));
    }
    return tempListResult;
  } catch (e) {
    throw e;
  }
};
export const pushListValueToArrayDupName = (tempList: any[]): any[] => {
  try {
    let tempListResult: any[] = [];
    for (let i = 0; i < tempList.length; i++) {
      tempListResult.push(groupToAVGDup(tempList[i]));
    }
    return tempListResult;
  } catch (e) {
    throw e;
  }
};
export const setTo24 = (list: any[]) :any[]=> {
  const maxHours = 24;
  const tempValue = list.filter((v) => v != null)[0][0];
  const listObj = [];
  let tempList = [];
  list.forEach((v) => {
    listObj.push(...v);
  });
  for (let i = 0; i < maxHours; i++) {
    const mapHour = _.filter(listObj, (o) => o.hours === i);
    if (mapHour.length !== 0) {
      tempList[i] = mapHour;
    } else {
      const date =
        dayjs(tempValue.dateTime).format('YYYY-MM-DD') + ' ' + `${i}:00`;
      const value = [
        {
          id:
            tempValue.plantName +
            '-' +
            dayjs(tempValue.dateTime, 'YYYY-MM-DD').format('YYYYMMDD') +
            dayjs(`${i}:00`, 'HH:mm').format('HHmm'),
          dateTime:
            dayjs(tempValue.dateTime).format('YYYY-MM-DD') + ' ' + `${i}:00`,
          type: tempValue.type,
          radiation: 0,
          powerGeneration: 0,
          plantName:tempValue.plantName,
          hours: dayjs(date).get('h')
        }
      ];
      tempList[i] = value;
    }
  }
  return tempList;
};
export const getRadiationDupName = (list: any[]): Value[] => {
  const totalOfList = list.length;
  const maxHours = 24;
  const tempList: Value[] = [];
  if (totalOfList === 1) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue = _.groupBy(list[0], 'hours');
      tempForCalculate.push(...listValue[i.toString()]);

      const getTemp = listValue[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: calculateDupRadiation(tempForCalculate),
        powerGeneration: 0,
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else if (totalOfList === 2) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue1 = _.groupBy(list[0], 'hours');
      const listValue2 = _.groupBy(list[1], 'hours');
      tempForCalculate.push(...listValue1[i.toString()]);
      tempForCalculate.push(...listValue2[i.toString()]);
      const getTemp = listValue1[i.toString()]
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation: calculateDupRadiation(tempForCalculate),
        powerGeneration: 0,
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else {
    tempList.push({
      id: '',
      dateTime: new Date(),
      radiation: 0,
      powerGeneration: 0,
      plantName: '',
      type: ''
    });
  }
  return tempList;
};
export const getRadiationDifName = (list: any[]): Value[] => {
  const totalOfList = list.length;
  const maxHours = 24;
  const tempList: Value[] = [];
  if (totalOfList === 1) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue = _.groupBy(list[0], 'hours');
      tempForCalculate.push(...listValue[i.toString()]);

      const getTemp = listValue[i.toString()]
      const namePlant = "Muroran";
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation:list[0][0].plantName.toString().search(namePlant) === -1? calculateDifRadiation(tempForCalculate):calculateDifRadiationAdd2(tempForCalculate),
        powerGeneration: 0,
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else if (totalOfList === 2) {
    //  TODO: sum by hours
    for (let i = 0; i < maxHours; i++) {
      let tempForCalculate: any[] = [];
      const listValue1 = _.groupBy(list[0], 'hours');
      const listValue2 = _.groupBy(list[1], 'hours');
      tempForCalculate.push(...listValue1[i.toString()]);
      tempForCalculate.push(...listValue2[i.toString()]);
      const getTemp = listValue1[i.toString()]
      const namePlant = "Muroran";
      tempList.push({
        id: getTemp[0].id,
        dateTime: getTemp[0].dateTime,
        radiation:list[0][0].plantName.toString().search(namePlant) === -1? calculateDifRadiation(tempForCalculate):calculateDifRadiationAdd2(tempForCalculate),
        powerGeneration: 0,
        plantName: list[0][0].plantName,
        type: list[0][0].type
      });
    }
  } else {
    tempList.push({
      id: '',
      dateTime: new Date(),
      radiation: 0,
      powerGeneration: 0,
      plantName: '',
      type: ''
    });
  }
  return tempList;
};


export const calculatePowerGeneration = (list: Value[]) => {
  return calculate(CALCULATE.ONE_FILE_POWER_GEN, list);
};

export const calculateRadiation = (list: Value[]) => {
  return calculate(CALCULATE.ONE_FILE_RADIATION, list);
};

export const calculatePowerDupGeneration = (list: Value[] = []) => {
  return calculate(CALCULATE.MULTI_FILE_DUP_NAME_POWER_GEN, list);
};

export const calculateDupRadiation = (list: Value[] = []) => {
  return calculate(CALCULATE.MULTI_FILE_DUP_NAME_RADIATION, list);
};
export const calculatePowerDifGeneration = (list: Value[] = []) => {
  return calculate(CALCULATE.MULTI_FILE_DIF_NAME_POWER_GEN, list);
};

export const calculateDifRadiation = (list: Value[] = []) => {
  return calculate(CALCULATE.MULTI_FILE_DIF_NAME_RADIATION, list);
};
export const calculateDifRadiationAdd2 = (list: Value[] = []) => {
  return calculate(CALCULATE.MULTI_FILE_DIF_NAME_2000_RADIATION, list);
};
