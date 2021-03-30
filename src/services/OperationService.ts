import { getRepository } from 'typeorm';
import { ConfigFile } from '../entity/configFile.entity';
import { FileUpload } from '../types/FileUpload';
import { CheckFileType } from '../utils/ReadFile';
import { roundUpNumber, sumAVG, sum } from '../utils/calculate';
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
      this.listItemRadiationPreview = this.mergeListOfValue(tempListPreview);

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

      this.listItemPowerGenerationPreview = this.mergeListOfValue(
        temListPreview
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
      this.listItemRadiationPreview = tempListBeforeCalculate;
      // TODO: calculate Radiation
      this.listItemRadiation = getRadiationDupName(tempListBeforeCalculate);

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
        throw new Error(messageFileInvalid);
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
