import { getRepository } from 'typeorm';
import { ConfigFile } from '../entity/configFile.entity';
import { FileUpload } from '../types/FileUpload';
import { CheckFileType } from '../utils/ReadFile';
import {
  messageConfigNotFound,
  messageFileInvalid
} from '../config/errorConfig';
const dayjs = require('dayjs');
const XLSX = require('xlsx');
const customParseFormat = require('dayjs/plugin/customParseFormat');
import { ConfigParameter } from '../interface/operation/configParameter';
import {
  groupMinutesToHour,
  getPowerGen,
  getRadiation,
  pushListValueToArray,
  getPowerGenMultiFileDiffName,
  setTo24,
  getPowerGenMultiFileDupName,
  pushListValueToArrayDupName,
  getRadiationDupName,
  getRadiationDifName
} from '../functions/operations/operation';

import Value from '../interface/operation/value'
import {Type} from '../enum/OperationTypes'
import {checkNumberNull} from '../utils/Util'

dayjs.extend(customParseFormat);

const _ = require('lodash');
const numeral = require('numeral');

class OperationService {

  public listItemRadiation: Value[] = [];
  public listItemPowerGeneration: Value[] = [];
  public listItemRadiationPreview: Value[] = [];
  public listItemPowerGenerationPreview: Value[] = [];

  public calculatedPowerGenMultipleFileAndDiffName(
    config: ConfigParameter[],
    type: string,
    date: string
  ) {
    let tempList: any[] = [];
    let tempListPreview: any = [];
    let tempListBeforeCalculate: any = [];
    let setToList24Index: any = [];
    for (let i = 0; i < config.length; i++) {
      const configMapping = config[i].config[0];
      // TODO: read config by index
      if (configMapping.configFileMappings.length !== 0) {
        for (const itemConfig of configMapping.configFileMappings) {
          // TODO: get value from CSV || EXEL
          let resultFile: Value[] = excelExtract(
            itemConfig.sheet,
            config[i].file,
            itemConfig.rowStart,
            itemConfig.rowStop,
            itemConfig.columnPoint,
            configMapping.configFileFormatDate.columnPoint,
            configMapping.configFileFormatDate.datetimeFormat,
            date,
            configMapping.plantName,
            itemConfig.key
          );

          tempList.push(groupMinutesToHour(resultFile));
          tempListPreview.push(groupMinutesToHour(resultFile));
        }
      } else {
        //  not config for  config[i].plantName
        // catch here
        throw new Error(messageConfigNotFound);
      }
    }

    // TODO: set index to 24 hours
    for (const list of tempList) {
      setToList24Index.push(setTo24(list));
    }

    // TODO: get avg radiation,power gen case min
    tempListBeforeCalculate = pushListValueToArray(setToList24Index);

    // TODO: set previewList
    this.listItemPowerGenerationPreview = this.mergeListOfValue(
      tempListPreview
    );

    // TODO: get PowerGen
    this.listItemPowerGeneration = getPowerGenMultiFileDiffName(
      tempListBeforeCalculate
    );

    return this;
  }

  public calculatedRadiationMultipleFileAndDiffName(
    config: ConfigParameter[],
    type: string,
    date: string
  ) {
    let tempList: any[] = [];
    let tempListPreview: any = [];
    let tempListBeforeCalculate: any = [];
    let setToList24Index: any = [];

    for (let i = 0; i < config.length; i++) {
      const configMapping = config[i].config[0];
      // TODO: read config by index
      if (configMapping.configFileMappings.length !== 0) {
        for (const itemConfig of configMapping.configFileMappings) {
          // TODO: get value from CSV || EXEL
          let resultFile: Value[] = excelExtract(
            itemConfig.sheet,
            config[i].file,
            itemConfig.rowStart,
            itemConfig.rowStop,
            itemConfig.columnPoint,
            configMapping.configFileFormatDate.columnPoint,
            configMapping.configFileFormatDate.datetimeFormat,
            date,
            configMapping.plantName,
            itemConfig.key
          );
          tempList.push(groupMinutesToHour(resultFile));
          tempListPreview.push(groupMinutesToHour(resultFile));
        }
      } else {
        throw new Error(messageConfigNotFound);
      }
    }

    for (const list of tempList) {
      setToList24Index.push(setTo24(list));
    }

    // TODO: set index to 24 hours
    tempListBeforeCalculate = pushListValueToArray(setToList24Index);

    this.listItemRadiationPreview = setToList24Index

    this.listItemRadiation = getRadiationDifName(tempListBeforeCalculate);

    return this;
  }

  public calculatedPowerGenMultipleFileDupName(
    config: ConfigFile[],
    type: string,
    date: string,
    rawData: any
  ) {
    let tempList: any = [];
    let tempListPreview: any = [];
    let tempListBeforeCalculate: any = [];
    let setToList24Index: any = [];
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
        tempList.push(groupMinutesToHour(result));
        tempListPreview.push(groupMinutesToHour(result));
      }
      for (const list of tempList) {
        setToList24Index.push(setTo24(list));
      }

      // TODO: set index to 24 hours
      tempListBeforeCalculate = pushListValueToArrayDupName(setToList24Index);

      this.listItemPowerGenerationPreview = this.mergeListOfValue(
        tempListPreview
      );

      this.listItemPowerGeneration = getPowerGenMultiFileDupName(
        tempListBeforeCalculate
      );

      return this;
    } else {
      throw new Error(messageConfigNotFound);
    }
  }

  public calculatedRadiationMultipleFileSameName(
    Config: ConfigFile[],
    type: string,
    date: string,
    rawData: any
  ) {
    let tempList: any = [];
    let temListPreview: any = [];
    let tempListBeforeCalculate: any = [];
    let setToList24Index: any = [];

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
        // TODO: push to List
        tempList.push(groupMinutesToHour(result));
        temListPreview.push(result);
      }

      for (const list of tempList) {
        setToList24Index.push(setTo24(list));
      }

      // TODO: set index to 24 hours
      tempListBeforeCalculate = pushListValueToArray(setToList24Index);

      // TODO: getList Preview Radiation
      this.listItemRadiationPreview = temListPreview;
      // TODO: calculate Radiation
      this.listItemRadiation = getRadiationDupName(tempListBeforeCalculate);

      return this;
    } else {
      throw new Error(messageConfigNotFound);
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
    let tempListBeforeCalculate: any = [];

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
        tempList.push(groupMinutesToHour(result));
        tempListPreview.push(result);
      }

      // TODO: set index to 24 hours
      tempListBeforeCalculate = pushListValueToArray(tempList);

      // TODO: getList Preview Radiation
      this.listItemRadiationPreview = tempListPreview

      // TODO: calculate Radiation
      this.listItemRadiation = getRadiation(tempListBeforeCalculate);

      return this;
    } else {
      throw new Error(messageConfigNotFound);
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
    let tempListBeforeCalculate: any = [];
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
        tempList.push(groupMinutesToHour(result));
        temListPreview.push(result);
      }
      // TODO: set index to 24 hours
      tempListBeforeCalculate = pushListValueToArray(tempList);

      this.listItemPowerGeneration = getPowerGen(tempListBeforeCalculate);

      this.listItemPowerGenerationPreview = temListPreview

      return this;
    } else {
      throw new Error(messageConfigNotFound);
    }
  }

  public mergeListOfValue(list: any) {
    let resultList: Value[] = [];
    for (const value of list) {
      resultList = [...resultList, ...value];
    }
    return resultList;
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
          this.calculatedPowerGenMultipleFileDupName(
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

          let listOfConfig: ConfigParameter[] = [];

          // TODO: map config
          if (fileName1.search(plantName1) !== -1) {
            const config: ConfigParameter = {
              plantName: plantName1,
              config: configPWR,
              file: file[0].data
            };
            listOfConfig.push(config);
          } else {
            const config: ConfigParameter = {
              plantName: plantName1,
              config: configPWR2,
              file: file[1].data
            };
            listOfConfig.push(config);
          }

          if (fileName2.search(plantName2) !== -1) {
            const config: ConfigParameter = {
              plantName: plantName2,
              config: configPWR2,
              file: file[1].data
            };
            listOfConfig.push(config);
          } else {
            const config: ConfigParameter = {
              plantName: plantName2,
              config: configPWR,
              file: file[0].data
            };
            listOfConfig.push(config);
          }

          this.calculatedPowerGenMultipleFileAndDiffName(
            listOfConfig,
            Type.PWR,
            date
          );

          // TODO: check config
          const fileName1R = file[0].name.split('.')[0];
          const fileName2R = file[1].name.split('.')[0];
          const plantName1R = configRADIATION[0].plantName;
          const plantName2R = configRADIATION2[0].plantName;

          let listOfConfigR: ConfigParameter[] = [];

          // TODO: map config
          if (fileName1R.search(plantName1R) !== -1) {
            const config: ConfigParameter = {
              plantName: plantName1R,
              config: configRADIATION,
              file: file[0].data
            };
            listOfConfigR.push(config);
          } else {
            const config: ConfigParameter = {
              plantName: plantName1R,
              config: configRADIATION2,
              file: file[1].data
            };
            listOfConfigR.push(config);
          }

          if (fileName2R.search(plantName2R) !== -1) {
            const config: ConfigParameter = {
              plantName: plantName2R,
              config: configRADIATION2,
              file: file[1].data
            };
            listOfConfigR.push(config);
          } else {
            const config: ConfigParameter = {
              plantName: plantName2R,
              config: configRADIATION,
              file: file[0].data
            };
            listOfConfigR.push(config);
          }

          this.calculatedRadiationMultipleFileAndDiffName(
            listOfConfigR,
            Type.RADIATION,
            date
          );

          return this;
        }
      }
      else if (file.length === 1) {
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
        throw new Error(messageFileInvalid);
      }
    } catch (e) {
      console.log(e.stack);
      throw new Error(e.message);
    }
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
  //read workbook
  const workBook = XLSX.read(data, { dateNF: 'M/d/YY HH:mm' });
  //get sheet number
  const sheetName = workBook.SheetNames[sheetNum - 1];
  //get sheet name
  const sheet = workBook.Sheets[sheetName];

  //column date
  columnDate = columnDate - 1;
  //row value
  rowStart = rowStart - 1;
  //column value
  columnValue = columnValue - 1;

  //get for rowstop if config rowstop eq null
  let sheetRef = XLSX.utils.decode_range(sheet['!ref']);
  if (!rowStop) {
    rowStop = sheetRef.e.r;
  }

  let values: Value[] = [];
  for (let i = rowStart; i < rowStop; i++) {
    //get cell from row and column
    let cell_address = { c: columnValue, r: i };
    //extract data from row and column
    let data = XLSX.utils.encode_cell(cell_address);
    //get cell  date from row and column
    let cell_date = { c: columnDate, r: i };
    //extract date from row and column
    let dateCell = XLSX.utils.encode_cell(cell_date);

    //convert format date input YYYYMMDD
    const dateInput = dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD');
    //convert format get only hour and minute HHmm
    const dateCellHourMinute = dayjs(XLSX.utils.format_cell(sheet[dateCell]), dateFormat).format('HHmm')
    //convert for datetime YYYY-MM-DD HH:mm
    const dateTimeFormat = dayjs(date+dateCellHourMinute,'YYYY-MM-DDHHmm').format("YYYY-MM-DD HH:mm")
    //format id plantName-YYYYMMDDHHmm
    const idFormat:string = `${plantName}-${dateInput}${dateCellHourMinute}`;
    
    const radiation = (key !== Type.PWR)?checkNumberNull(numeral(XLSX.utils.format_cell(sheet[data]))._value):0
    const pwr = (key === Type.PWR) ? checkNumberNull(numeral(XLSX.utils.format_cell(sheet[data]))._value): 0
    
    let value: Value = {
      id:idFormat,
      plantName: plantName,
      dateTime: dateTimeFormat,
      radiation:radiation,
      powerGeneration:pwr,
      type: key
    };
    values.push(value);
  }
  return values;
};

export const operationService = new OperationService();
