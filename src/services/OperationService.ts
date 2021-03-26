import { getRepository } from 'typeorm';
import { ConfigFile } from '../entity/configFile.entity';
import { FileUpload } from '../types/FileUpload';
import { CheckFileType } from '../utils/ReadFile';
import { roundUpNumber, sumAVG, sum } from '../utils/calculate';
const dayjs = require('dayjs');
const XLSX = require('xlsx');
const customParseFormat = require('dayjs/plugin/customParseFormat');
import { ConfigParameter } from '../interface/operation/configParameter';
dayjs.extend(customParseFormat);

const _ = require('lodash');
const numeral = require('numeral');

class OperationService {
  public listItemRadiation: Value[] = [];
  public listItemPowerGeneration: Value[] = [];
  public listItemRadiationPreview: Value[] = [];
  public listItemPowerGenerationPreview: Value[] = [];


  public sunPowerGenMultiFileCaseDiffName(listFile: any[]) {
    const tempList = [];
    const hour: number = 24;
    const formatDate: string = `2021-01-01`; // ignore value of day finally get only hour

    // TODO: Group by hour by start at 0:00 to 23:55
    for (let i = 0; i < hour; i++) {
      const findHours = listFile.filter(
        (d) =>
          dayjs(`${formatDate} ${i}:00`).get('h') === dayjs(d.dateTime).get('h')
      );
      if (findHours.length !== 0) {
        tempList.push(findHours);
      }
    }
    return tempList;
  }
  public checkInputHours(list:Value[]) {
    const maxHour = 24;
    let tempList = [];
    const formatDate: string = `2021-01-01`; // ignore value of day finally get only hour

    // TODO: Group by hour by start at 0:00 to 23:55
    for (let i = 0; i < maxHour; i++) {
      const findHours = list.filter(
        (d) =>
          dayjs(`${formatDate} ${i}:00`).get('h') === dayjs(d.dateTime).get('h')
      );
      if (findHours.length !== 0) {
        tempList.push(...findHours);
      } else {
        const getTemp = list.filter((d: Value) => d !== null);
        tempList.push({
          id:
            getTemp[0].plantName +
            '-' +
            dayjs(getTemp[0].dateTime, 'YYYY-MM-DD').format('YYYYMMDD') +
            dayjs(`${i}:00`, 'HH:mm').format('HHmm'),
          plantName: getTemp[0].plantName,
          dateTime:
            dayjs(getTemp[0].dateTime).format('YYYY-MM-DD') + ' ' + `${i}:00`,
          radiation: 0,
          powerGeneration: 0,
          type: getTemp[0].plantName
        });
      }
    }
    return tempList;
  }
  public calculatedPowerGenMultipleFileDiffNameTypeKWattAVG(list: Value[]) {
    const maxHour = 24;
    let tempList = [];
    const formatDate: string = `2021-01-01`; // ignore value of day finally get only hour

    // TODO: Group by hour by start at 0:00 to 23:55
    for (let i = 0; i < maxHour; i++) {
      const findHours = list.filter(
        (d) =>
          dayjs(`${formatDate} ${i}:00`).get('h') === dayjs(d.dateTime).get('h')
      );
      if (findHours.length !== 0) {
        tempList.push(...findHours);
      } else {
        const getTemp = list.filter((d: Value) => d !== null);
        tempList.push({
          id:
            getTemp[0].plantName +
            '-' +
            dayjs(getTemp[0].dateTime, 'YYYY-MM-DD').format('YYYYMMDD') +
            dayjs(`${i}:00`, 'HH:mm').format('HHmm'),
          plantName: getTemp[0].plantName,
          dateTime:
            dayjs(getTemp[0].dateTime).format('YYYY-MM-DD') + ' ' + `${i}:00`,
          radiation: 0,
          powerGeneration: 0,
          type: getTemp[0].plantName
        });
      }
    }
    //  TODO : return new Array
    console.log(tempList);
    return tempList;
  }
  public calculatedPowerGenMultipleFileAndDiffName(
    config:ConfigParameter[],
    type: string,
    date: string
  ) {


    let tempList: any[] = [];
    let tempListPreview: any = [];

    for (let i = 0; i < config.length; i++) {
        const configMapping = config[i].config[0];
      // TODO: read config by index
      if(configMapping.configFileMappings.length !== 0) {
        for (const itemConfig of configMapping.configFileMappings) {
          // TODO: get value from CSV || EXEL
          let resultFile: Value [] = excelExtract(
            itemConfig.sheet,
            config[i].file,
            itemConfig.rowStart,
            itemConfig.rowStop,
            itemConfig.columnPoint,
            configMapping.configFileFormatDate.columnPoint,
            configMapping.configFileFormatDate.datetimeFormat,
            date,
            configMapping.plantName,
            itemConfig.key);
          if(resultFile.length <= 24) {
          //  TODO: case Kwn/m
            tempList.push(this.checkInputHours(resultFile))
            tempListPreview.push(this.checkInputHours(resultFile))
          } else {
          // TODO: case W/m^2
            tempList.push(this.calculatedPowerGenMultipleFileDiffNameTypeWattAVG(resultFile))
          }
        }

        } else {
        //  not config for  config[i].plantName
        }
    }
      console.log(tempList)
      let mergeArray = this.mergeListOfValue(tempList)
      let groupArray = this.sunPowerGenMultiFileCaseDiffName(mergeArray);
      this.listItemPowerGenerationPreview =this.mergeListOfValue(tempListPreview);
      this.listItemPowerGeneration = this.calculatedPowerGenCaseMultiFileByHour(groupArray);
      return this;
  }
  public calculatedPowerGenMultipleFile(
    config: ConfigFile[],
    type: string,
    date: string,
    rawData: any
  ) {
    let tempList: any = [];
    let tempListPreview: any = [];
    if (config[0].configFileMappings.length !== 0) {
      // TODO: read config by index
      for (const itemConfig of config[0].configFileMappings) {
        // TODO: get value from CSV || EXEL
        let result: Value[] = excelExtract(
          itemConfig.sheet,
          rawData,
          itemConfig.rowStart,
          itemConfig.rowStop,
          itemConfig.columnPoint,
          config[0].configFileFormatDate.columnPoint,
          config[0].configFileFormatDate.datetimeFormat,
          date,
          config[0].plantName,
          itemConfig.key
        );

        if (result.length <= 24) {
          // TODO: case get list by hours
          tempList.push(this.calculatedPowerGenMultipleFileTypeKWh(result));
          tempListPreview.push(result);
        } else {
          // TODO: case get list by min
          tempList.push(this.calculatedPowerGenMultipleFileTypeKWhAVG(result));
          tempListPreview.push(result);
        }
      }
      // console.log("=====")
      // console.log(tempList)
      // TODO: merge array
      let listValue: Value[] = [];
      let listValuePreview: Value[] = [];
      for (const value of tempList) {
        listValue = [...listValue, ...value];
      }

      for (const value of tempListPreview) {
        listValuePreview = [...listValuePreview, ...value];
      }
      this.listItemPowerGenerationPreview = listValuePreview;
      this.listItemPowerGeneration = listValue;
      return this;
    } else {
      throw new Error('config not found');
    }
  }
  public calculatedPowerGen(
    config: ConfigFile[],
    type: string,
    date: string,
    rawData: any
  ) {
    let tempList: any = [];
    let temListPreview: any = [];
    if (config[0].configFileMappings.length !== 0) {
      // TODO: read config by index

      for (const itemConfig of config[0].configFileMappings) {
        // TODO: get value from CSV || EXEL
        let result: Value[] = excelExtract(
          itemConfig.sheet,
          rawData,
          itemConfig.rowStart,
          itemConfig.rowStop,
          itemConfig.columnPoint,
          config[0].configFileFormatDate.columnPoint,
          config[0].configFileFormatDate.datetimeFormat,
          date,
          config[0].plantName,
          itemConfig.key
        );
        if (result.length <= 24) {
          tempList.push(this.calculatedPowerGenTypeKWh(result));
          temListPreview.push(result);
        } else {
          tempList.push(this.calculatedPowerGenCaseMinTypeKWh(result));
          temListPreview.push(result);
        }
      }
      // TODO: merge array
      this.listItemPowerGeneration = this.mergeListOfValue(tempList);
      this.listItemPowerGenerationPreview = this.mergeListOfValue(
        temListPreview
      );

      return this;
    } else {
      throw new Error('config not found');
    }
  }
  public calculatedPowerGenTypeKWh(list: Value[]) {
    return list;
  }
  public calculatedPowerGenCaseMinTypeKWh(list: Value[]) {
    const tempList = this.groupPowerGenToHour(list);

    return this.calculatedPowerGenByMin(tempList);
  }

  public calculatedPowerGenMultipleFileTypeKWh(list: Value[]) {
    const listGroupByHour: Value[] = this.groupRadiationToHour(list);

    return this.calculatedPowerGenCaseMultiFileByHour(listGroupByHour);
  }
  public calculatedPowerGenMultipleFileDiffNameTypeWattAVG(list: Value[]) {
    const listGroupByHour: Value[] = this.groupRadiationToHour(list);

    return this.calculatedPowerGenByMin(listGroupByHour);
  }
  public calculatedPowerGenMultipleFileTypeKWhAVG(list: Value[]) {
    const listGroupByHour: Value[] = this.groupRadiationToHour(list);
    return this.calculatedPowerGenCaseMultiFileByHour(listGroupByHour);
  }
  public calculatedPowerGenByMin(list: any) {
    let tempList = [];
    for (let i = 0; i < list.length; i++) {
      const sumPowerGeneration = sum(list[i], 'powerGeneration');
      list[i][0].powerGeneration =
        sumPowerGeneration /
        list[i].map((v: Value) => v.powerGeneration).length;
      tempList.push(list[i][0]);
    }
    return tempList;
  }
  public calculatedRadiationMultipleFileSameName(
    Config: ConfigFile[],
    type: string,
    date: string,
    rawData: any
  ) {
    let tempList: any = [];
    let temListPreview: any = [];
    let tempValue: Value;
    if (Config[0].configFileMappings.length !== 0) {
      // TODO: read config by index1
      for (const itemConfig of Config[0].configFileMappings) {
        if (itemConfig.unit === 'kWh') {
          // TODO: get value from CSV || EXEL
          let result: Value[] = excelExtract(
            itemConfig.sheet,
            rawData,
            itemConfig.rowStart,
            itemConfig.rowStop,
            itemConfig.columnPoint,
            Config[0].configFileFormatDate.columnPoint,
            Config[0].configFileFormatDate.datetimeFormat,
            date,
            Config[0].plantName,
            itemConfig.key
          );
          // TODO: push to List

          temListPreview.push(result);
          tempList.push(this.calculatedRadiationTypeKWhMultipleFile(result));
        } else {
          // TODO: get value from CSV || EXEL
          //let result: Value [] = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, Config[0].configFileFormatDate.columnPoint, Config[0].configFileFormatDate.datetimeFormat, date, Config[0].plantName, itemConfig.key);
        }
      }

      // TODO: merge array
      let listValue: Value[] = [];
      let listValuePreview: Value[] = [];
      for (const value of tempList) {
        listValue = [...listValue, ...value];
      }

      for (const value of temListPreview) {
        listValuePreview = [...listValuePreview, ...value];
      }
      // TODO: getList Preview Radiation
      // this.listItemRadiationPreview = listValuePreview;
      this.listItemRadiationPreview = listValuePreview;
      // TODO: calculate Radiation
      this.calculatedValueOfRadiation(
        tempList[0],
        Config[0].configFileMappings.length,
        listValue
      );
      return this;
    } else {
      throw new Error('config not found');
    }
  }

  public calculatedRadiationMultipleFile(
    Config: ConfigFile[],
    type: string,
    date: string,
    rawData: any
  ) {
    let tempList: any = [];
    let temListPreview: any = [];
    let tempValue: Value;
    if (Config[0].configFileMappings.length !== 0) {
      // TODO: read config by index1
      for (const itemConfig of Config[0].configFileMappings) {
        // TODO: get value from CSV || EXEL
        let result: Value[] = excelExtract(
          itemConfig.sheet,
          rawData,
          itemConfig.rowStart,
          itemConfig.rowStop,
          itemConfig.columnPoint,
          Config[0].configFileFormatDate.columnPoint,
          Config[0].configFileFormatDate.datetimeFormat,
          date,
          Config[0].plantName,
          itemConfig.key
        );
        if (result.length <= 24) {
          tempList.push(this.calculatedRadiationTypeKWh(result));
        } else {
          temListPreview.push(result);
          tempList.push(this.calculatedRadiationTypeKWhMultipleFile(result));
        }
      }

      console.log(tempList);
      // TODO: merge array
      let listValue: Value[] = [];
      let listValuePreview: Value[] = [];
      for (const value of tempList) {
        listValue = [...listValue, ...value];
      }

      for (const value of temListPreview) {
        listValuePreview = [...listValuePreview, ...value];
      }
      // TODO: getList Preview Radiation
      // this.listItemRadiationPreview = listValuePreview;
      this.listItemRadiationPreview = listValuePreview;
      // TODO: calculate Radiation
      this.calculatedValueOfRadiation(
        tempList[0],
        Config[0].configFileMappings.length,
        listValue
      );
      return this;
    } else {
      throw new Error('config not found');
    }
  }
  public calculatedRadiation(
    Config: ConfigFile[],
    type: string,
    date: string,
    rawData: any
  ) {
    let tempList: any = [];
    let tempListPreview: any = [];

    if (Config[0].configFileMappings.length !== 0) {
      // TODO: read config by index1
      for (const itemConfig of Config[0].configFileMappings) {
        // TODO: get value from CSV || EXEL
        let result: Value[] = excelExtract(
          itemConfig.sheet,
          rawData,
          itemConfig.rowStart,
          itemConfig.rowStop,
          itemConfig.columnPoint,
          Config[0].configFileFormatDate.columnPoint,
          Config[0].configFileFormatDate.datetimeFormat,
          date,
          Config[0].plantName,
          itemConfig.key
        );
        if (result.length < 24) {
          // TODO: push to List
          tempList.push(this.calculatedRadiationTypeKWh(result));
          tempListPreview.push(result);
        } else {
          // TODO: convert to Unit W and push to List
          tempList.push(this.calculatedRadiationTypeW(result));
          tempListPreview.push(result);
        }
      }
      // TODO: merge array
      let listValue: Value[] = this.mergeListOfValue(tempList);

      // TODO: getList Preview Radiation
      this.listItemRadiationPreview = this.mergeListOfValue(tempListPreview);

      // TODO: calculate Radiation
      this.calculatedValueOfRadiation(
        tempList[0],
        Config[0].configFileMappings.length,
        listValue
      );
      return this;
    } else {
      throw new Error('config not found');
    }
  }

  public calculatedValueOfRadiation(
    list: Value[],
    size: number,
    totalArray: Value[]
  ) {
    let resultList: Value[] = [];
    if (list.length !== 0) {
      list.forEach((v) => {
        // TODO: filter by hours
        let findByTime = totalArray.filter((d) => v.dateTime === d.dateTime);
        if (findByTime) {
          // TODO: sum value radiation by hours
          let total = findByTime
            .map((v) => v.radiation)
            .reduce((a, b) => a + b, 0);
          // TODO: sum avg
          v.radiation = Number(
            (Math.round((total / size) * 100) / 100).toFixed(2)
          );
          resultList.push(v);
        } else {
          // TODO: return value do not change anything
          resultList.push(v);
        }
      });
      this.listItemRadiation = resultList;
      return this;
    } else {
      throw new Error('no list by config 2');
    }
  }

  public calculatedValueAVGOfPowerGen(
    list: Value[],
    size: number,
    totalArray: Value[]
  ) {
    let resultList: Value[] = [];
    if (list.length !== 0) {
      list.forEach((v) => {
        let findByTime = totalArray.filter((d) => v.dateTime === d.dateTime);
        if (findByTime) {
          let total = findByTime
            .map((v) => v.radiation)
            .reduce((a, b) => a + b, 0);
          v.radiation = total / size;
          resultList.push(v);
        } else {
          resultList.push(v);
        }
      });
      this.listItemRadiation = resultList;
      return this;
    } else {
      throw new Error('no list by config 2');
    }
  }

  public mergeListOfValue(list: any) {
    let resultList: Value[] = [];
    for (const value of list) {
      resultList = [...resultList, ...value];
    }
    return resultList;
  }

  public calculatedPowerGenCaseMultiFileByHour(list: any) {
    let tempList = [];
    for (let i = 0; i < list.length; i++) {
      // console.log("sumRadiation", sumPowerGeneration/list[i].map((v:Value)=> v.powerGeneration).length)
      list[i][0].powerGeneration = sum(list[i], 'powerGeneration');
      tempList.push(list[i][0]);
    }
    return tempList;
  }

  public calculatedRadiationTypeW(list: Value[]) {
    // TODO check empty array
    if (list.length === 0) {
      //TODO: list not found calculatedRadiationTypeW
      throw new Error('List not found');
    }
    // TODO : GROUP By hour
    let tempListGroupByHour = this.groupRadiationToHour(list);

    // TODO: sum radiation by hour
    const listResult = this.calculatedRadiationByHourOneFile(
      tempListGroupByHour
    );

    return listResult;
  }

  public groupRadiationToHour(list: Value[]) {
    const hour: number = 24;
    let tempList = [];
    const formatDate: string = `2021-01-01`; // ignore value of day finally get only hour

    // TODO: Group by hour by start at 0:00 to 23:55
    for (let i = 0; i < hour; i++) {
      const findHours = list.filter(
        (d) =>
          dayjs(`${formatDate} ${i}:00`).get('h') === dayjs(d.dateTime).get('h')
      );
      if (findHours.length !== 0) {
        tempList.push(findHours);
      } else {
        const getTemp = list.filter((d: Value) => d !== null);
        tempList.push([
          {
            id:
              getTemp[0].plantName +
              '-' +
              dayjs(getTemp[0].dateTime, 'YYYY-MM-DD').format('YYYYMMDD') +
              dayjs(`${i}:00`, 'HH:mm').format('HHmm'),
            plantName: getTemp[0].plantName,
            dateTime:
              dayjs(getTemp[0].dateTime).format('YYYY-MM-DD') + ' ' + `${i}:00`,
            radiation: 0,
            powerGeneration: 0,
            type: getTemp[0].plantName
          }
        ]);
      }
    }
    //  TODO : return new Array
    return tempList;
  }

  public groupPowerGenToHour(list: Value[]) {
    const hour: number = 24;
    let tempList = [];
    const formatDate: string = `2021-01-01`; // ignore value of day finally get only hour
    // TODO: Group by hour by start at 0:00 to 23:55
    //
    for (let i = 0; i < hour; i++) {
      const findHours = list.filter(
        (d: Value) =>
          dayjs(`${formatDate} ${i}:00`).get('h') === dayjs(d.dateTime).get('h')
      );
      if (findHours.length !== 0) {
        tempList.push(findHours);
      } else {
        const getTemp = list.filter((d: Value) => d !== null);
        tempList.push([
          {
            id:
              getTemp[0].plantName +
              '-' +
              dayjs(getTemp[0].dateTime, 'YYYY-MM-DD').format('YYYYMMDD') +
              dayjs(`${i}:00`, 'HH:mm').format('HHmm'),
            plantName: getTemp[0].plantName,
            dateTime:
              dayjs(getTemp[0].dateTime).format('YYYY-MM-DD') + ' ' + `${i}:00`,
            radiation: 0,
            powerGeneration: 0,
            type: getTemp[0].plantName
          }
        ]);
      }
    }
    //  TODO : return new Array
    return tempList;
  }

  public calculatedRadiationTypeKWh(list: Value[]) {
    return list;
  }

  public calculatedRadiationTypeKWhMultipleFile(list: Value[]) {
    // TODO check empty array
    if (list.length === 0) {
      //TODO: list not found calculatedRadiationTypeW
      throw new Error('List not found');
    }

    // TODO : GROUP By hour
    let tempListGroupByHour = this.groupRadiationToHour(list);

    // TODO: sum radiation by hour
    const listResult = this.calculatedRadiationByHour(tempListGroupByHour);
    return listResult;
  }

  public calculatedRadiationByHour(list: any) {
    let tempList = [];
    for (let i = 0; i < list.length; i++) {
      const sumRadiation =
        list[i]
          .map((v: Value) => v.radiation)
          .reduce((a: any, b: any) => a + b, 0) /
        list[i].length /
        1000;
      list[i][0].radiation = sumRadiation;
      list[i][0].dateTime = dayjs(list[i][0].dateTime)
        .startOf('h')
        .format('YYYY-MM-DD HH:mm');
      tempList.push(list[i][0]);
    }
    return tempList;
  }
  public calculatedRadiationByHourOneFile(list: any) {
    let tempList = [];
    for (let i = 0; i < list.length; i++) {
      list[i][0].radiation = sumAVG(list[i], 'radiation');
      list[i][0].dateTime = dayjs(list[i][0].dateTime)
        .startOf('h')
        .format('YYYY-MM-DD HH:mm');
      tempList.push(list[i][0]);
    }
    return tempList;
  }

  public checkSameFileName(file1: string, file2: string): boolean {
    let fileOne = file1.split('_', 1);
    let fileTwo = file2.split('_', 1);
    return fileOne[0] === fileTwo[0];
  }

  public async uploadFile(file: FileUpload[], date: string) {
    try {
      if (file.length === 2) {
        // TODO: CheckFileType is CSV || XLSX
        const fileList: FileUpload = CheckFileType(file[0]);
        const fileList2: FileUpload = CheckFileType(file[1]);

        //TODO: Check same Filename
        if (this.checkSameFileName(fileList.name, fileList2.name)) {
          const getConfig: ConfigFile[][] = await Promise.all([
            this.getConfigByPlantNameAndKeyAndFilename(
              fileList.name,
              Type.PWR,
              Type.PWR_JP
            ),
            this.getConfigByPlantNameAndKeyAndFilename(
              fileList2.name,
              Type.RADIATION,
              Type.RADIATION_JP
            )
          ]);
          const configPWR: ConfigFile[] = getConfig[0];
          const configRADIATION: ConfigFile[] = getConfig[1];

          const filePwr: any = file[0].name.includes(Type.PWR_JP)
            ? file[0].data
            : file[1].data;

          const fileRadiation: any = file[1].name.includes(Type.RADIATION_JP)
            ? file[1].data
            : file[0].data;

          // TODO: calculated MultipleFile case Power Gen and get Preview List
          this.calculatedPowerGenMultipleFile(
            configPWR,
            Type.PWR,
            date,
            filePwr
          );

          // TODO: calculated MultipleFile case Radiation and get Preview List
          this.calculatedRadiationMultipleFileSameName(
            configRADIATION,
            Type.RADIATION,
            date,
            fileRadiation
          );

          return this;
        } else {
          console.info('CASE: Multiple file');
          // TODO: GET config file
          const getConfig: ConfigFile[][] = await Promise.all([
            this.getConfigByPlantNameAndKey(fileList.name, Type.PWR),
            this.getConfigByPlantNameAndKey(fileList.name, Type.RADIATION),
            this.getConfigByPlantNameAndKey(fileList2.name, Type.PWR),
            this.getConfigByPlantNameAndKey(fileList2.name, Type.RADIATION)
          ]);

          // TODO: config value PowerGeneration File 1

          const configPWR: ConfigFile[] = getConfig[0];

          // TODO: config value radiation File 1
          const configRADIATION: ConfigFile[] = getConfig[1];

          // TODO: config value PowerGeneration File 2
          const configPWR2: ConfigFile[] = getConfig[2];

          // TODO: config value radiation File 2
          const configRADIATION2: ConfigFile[] = getConfig[3];



          // TODO: check config
          const fileName1 = file[0].name.split('.')[0];
          const fileName2 = file[1].name.split('.')[0];
          const plantName1 = configPWR[0].plantName;
          const plantName2 = configPWR2[0].plantName;


          let listOfConfig:ConfigParameter[] = [];

          // TODO: map config
          if (fileName1.search(plantName1) !== -1) {
            const config: ConfigParameter = {
              plantName:plantName1,
              config:configPWR,
              file:file[0].data
            }
            listOfConfig.push(config);
          } else {
            const config: ConfigParameter = {
              plantName:plantName1,
              config:configPWR2,
              file:file[1].data
            }
            listOfConfig.push(config)
          }

          if (fileName2.search(plantName2) !== -1) {
            const config: ConfigParameter = {
              plantName:plantName2,
              config:configPWR2,
              file:file[1].data
            }
            listOfConfig.push(config)
          } else {
            const config: ConfigParameter = {
              plantName:plantName2,
              config:configPWR,
              file:file[0].data
            }
            listOfConfig.push(config)
          }

          this.calculatedPowerGenMultipleFileAndDiffName(listOfConfig, Type.PWR, date);


          return this;
        }
      } else if (file.length === 1) {
        // TODO: CheckFileType is CSV || XLSX
        const fileList: FileUpload = CheckFileType(file[0]);

        // TODO: GET config file
        const getConfig: ConfigFile[][] = await Promise.all([
          this.getConfigByPlantNameAndKey(fileList.name, Type.PWR),
          this.getConfigByPlantNameAndKey(fileList.name, Type.RADIATION)
        ]);

        // TODO: config value PowerGeneration
        const configPWR: ConfigFile[] = getConfig[0];

        // TODO: config value radiation
        const configRADIATION: ConfigFile[] = getConfig[1];

        // TODO: calculated case Power Gen and get Preview List
        this.calculatedPowerGen(configPWR, Type.PWR, date, file[0].data);

        // TODO: calculated case Radiation and get Preview List
        this.calculatedRadiation(
          configRADIATION,
          Type.RADIATION,
          date,
          file[0].data
        );

        return this;
      } else {
        throw new Error('invalid file');
      }
    } catch (e) {
      console.log(e.stack);
      throw new Error(e.message);
    }
  }
  public async upload(request: any, date: string): Promise<Value[]> {
    const data: any = request.files;
    console.log(data.files);

    let values: any = [];
    let multiFile = checkMultipleFile(data.files);
    if (multiFile === undefined || multiFile.length === 0) {
    } else {
      for (const file of multiFile) {
        const plant = splitString(file.name, '_');
        console.log(file.name);
        console.log(plant[0]);
        const config = await this.getConfigByPlantName(plant[0]);
        console.log(config.length);

        // a function that return a delayed promise

        // const configRadia: ConfigFile[] = await this.getConfigByPlantNameAndKey(
        //   file.name,
        //   Type.RADIATION //key
        // );

        // const configPwr: ConfigFile[] = await this.getConfigByPlantNameAndKey(
        //   file.name,
        //   Type.PWR //key
        // );

        // Promise.all([configRadia, configPwr]).then(values => {
        //   console.log("This is Promise START ")
        //   console.log(values); // [3, 1337, "foo"]
        //   console.log("This is Promise END ")
        // });
        // console.log(configDto);

        console.log(
          '==================================END FILE==================================='
        );
        config.forEach(async (item, index) => {
          console.log(item.plantName);
          console.log(item.configFileFormatDate.datetimeFormat);
          item.configFileMappings.forEach((value) => {
            console.log(value.key);
            console.log(value.filename);
            console.log(file.name);

            if (value.filename) {
              let checkFilename: boolean = file.name.includes(value.filename);
              console.log(checkFilename);
              if (!checkFilename) {
                return; // out
              }
            }

            let excelValue = excelExtract(
              value.sheet,
              file.data,
              value.rowStart,
              value.rowStop,
              value.columnPoint,
              item.configFileFormatDate.columnPoint,
              item.configFileFormatDate.datetimeFormat,
              date,
              item.plantName,
              value.key
            );
            values = [...values, ...excelValue];
          });
        });
      }

      console.log('__tests__ check 1 2');
      // console.log(values.length);
      // console.log(
      //   _.chain(values)
      //     // Group the elements of Array based on `color` property
      //     .groupBy('type')
      //     // `key` is group's name (color), `value` is the array of objects
      //     .map((value: any, key: string) => ({ type: key, datas: value }))
      //     .value()
      // );

      // let testkub = ['radiation', 'radiation2', 'radiation3'];
      let summed = _(values)
        .groupBy('id')
        .map((objs: any, key: any) => {
          return {
            id: key,
            sumPwr: _.sumBy(objs, 'powerGeneration'),
            sumRadiation: _.divide(
              _.sumBy(objs, 'radiation', 'radiation2', 'radiation3'),
              2
              // _.sumBy(
              //   objs,
              //   _.pickBy(objs, (value, key) => value.length > 0),
              //   _.reject(objs, ['radiation2', undefined]),
              //   _.reject(objs, ['radiation3', undefined])
              // ),
              // _.sumBy(
              //   objs,
              //   _.reject(objs, ['radiation', undefined]),
              //   _.reject(objs, ['radiation2', undefined]),
              //   _.reject(objs, ['radiation3', undefined])
              // ).length
            ).toFixed(2)
          };
        })
        .value();

      console.log(summed);
    }
    return (
      _.chain(values)
        // Group the elements of Array based on `type` property
        .groupBy('type')
        .map((value: any, key: string) => ({ type: key, datas: value }))
        .value()
    );
    // return values;
  }
  public async getConfigByPlantName(plant: string): Promise<ConfigFile[]> {
    const configFileRepository = getRepository(ConfigFile);
    return await configFileRepository.find({
      plantName: plant
    });
  }
  public async getConfigByPlantNameAndKey(
    filename: string,
    key: string
  ): Promise<ConfigFile[]> {
    try {
      if (filename && key) {
        const plant = filename.split('_', 1);
        //Query by PlantName + key
        const result: ConfigFile[] = await getRepository(ConfigFile)
          .createQueryBuilder('configFile')
          .leftJoinAndSelect('configFile.configFileMappings', 'mapping')
          .leftJoinAndSelect('configFile.configFileFormatDate', 'mappingDate')
          .where('configFile.plantName = :name', { name: plant })
          .andWhere('mapping.key = :key', { key: key })
          .getMany()
          .then((response) => response)
          .catch((error) => error);
        return result;
      } else {
        const error = new Error('invalid input');
        throw error;
      }
    } catch (e) {
      throw e;
    }
  }

  public async getConfigByPlantNameAndKeyAndFilename(
    filename: string,
    key: string,
    filenameType: string
  ): Promise<ConfigFile[]> {
    try {
      if (filename && key && filenameType) {
        const plant = filename.split('_', 1);
        filenameType = plant + '_' + filenameType;
        //Query by PlantName + key
        const result: ConfigFile[] = await getRepository(ConfigFile)
          .createQueryBuilder('configFile')
          .leftJoinAndSelect('configFile.configFileMappings', 'mapping')
          .leftJoinAndSelect('configFile.configFileFormatDate', 'mappingDate')
          .where('configFile.plantName = :name', { name: plant })
          .andWhere('mapping.key like  :key', { key: `${key}%` })
          .andWhere('mapping.filename = :filename', { filename: filenameType })
          .getMany()
          .then((response) => response)
          .catch((error) => error);
        return result;
      } else {
        const error = new Error('invalid input');
        throw error;
      }
    } catch (e) {
      throw e;
    }
  }
}

const excelExtract = (
  sheetNum: number,
  data: any,
  rowStart: number,
  rowStop: number,
  columnValue: number,
  columnDate: number,
  dateFormat: string,
  date: string,
  plantName: string,
  key: string
) => {
  console.log(sheetNum);
  // "M/d/YY HH:mm"
  const workBook = XLSX.read(data, { dateNF: 'M/d/YY HH:mm' });
  //  const workBook = XLSX.read(data);
  //  const workBook = XLSX.read(data,{dateNF:dateFormat, cellDates:true, cellStyles:true });
  const sheetName = workBook.SheetNames[sheetNum - 1];
  const sheet = workBook.Sheets[sheetName];

  columnDate = columnDate - 1;
  rowStart = rowStart - 1;
  columnValue = columnValue - 1;
  // rowStop = XLSX.utils.decode_range(sheet['!ref']);
  // console.log(typeof rowStop)
  let sheetRef = XLSX.utils.decode_range(sheet['!ref']);
  if (!rowStop) {
    //null rowStop from config
    rowStop = sheetRef.e.r;
  }
  // console.log(demo)
  // console.log(demo.e.r)
  let values: Value[] = [];

  for (let i = rowStart; i < rowStop; i++) {
    let cell_address = { c: columnValue, r: i };
    let data = XLSX.utils.encode_cell(cell_address);
    let cell_date = { c: columnDate, r: i };
    let dateKub = XLSX.utils.encode_cell(cell_date);

    // console.log(
    //   XLSX.utils.format_cell(sheet[data]) +
    //     '   ' +
    //     XLSX.utils.format_cell(sheet[dateKub]) +
    //     '    ' +
    //     dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).get('hour') +
    //     '    ' +
    //     plantName +
    //     '-' +
    //     dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD') +
    //     dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).format('HHmm')
    // );

    let value: Value = {
      id:
        plantName +
        '-' +
        dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD') +
        dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).format(
          'HHmm'
        ),
      plantName: plantName,
      dateTime: dayjs(
        date +
          dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).format(
            'HH:mm'
          ),
        'YYYY-MM-DDHH:mm'
      ).format('YYYY-MM-DD HH:mm'),
      radiation:
        key !== Type.PWR
          ? numeral(XLSX.utils.format_cell(sheet[data]))._value
          : 0,
      powerGeneration:
        key === Type.PWR
          ? numeral(XLSX.utils.format_cell(sheet[data]))._value
          : 0,
      type: key
    };

    values.push(value);
  }

  const dateString = dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD');
  console.log('Date: ', plantName + '-' + dateString);

  console.log('_____________________________________________________');
  // console.log(values);
  return values;
};

const splitString = (value: string, pattern: string) => value.split(pattern);

const checkMultipleFile = (value: any) => {
  let oneFile = [];
  let multiFile = [];
  if (Array.isArray(value)) {
    // multi files
    console.log('MULTI FIELELE');
    console.log(value);
    multiFile = value;
  } else {
    // one filess
    console.log('ONEEE FIELELE');
    console.log(value);
    oneFile = value;
    multiFile.push(oneFile);
  }
  return multiFile;
};

enum Type {
  RADIATION = 'Radiation',
  PWR = 'PowerGeneration',
  GROUPPWR = 'GroupPowerGeneration',
  GROUPRADIATION = 'GroupRadiation',
  PWR_JP = '電力',
  RADIATION_JP = '気象'
}

interface Value {
  id: string;
  plantName: string;
  dateTime: Date;
  radiation: number;
  powerGeneration: number;
  type: string;
}

export const operationService = new OperationService();
