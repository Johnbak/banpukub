import { request } from 'express';
import { createQueryBuilder, getRepository } from 'typeorm';
import { ConfigFile } from '../entity/configFile.entity';

const dayjs = require('dayjs');
const XLSX = require('xlsx');
const customParseFormat = require('dayjs/plugin/customParseFormat');
import { FileUpload } from '../types/FileUpload';
import { CheckFileType } from '../utils/ReadFile';

dayjs.extend(customParseFormat);

const _ = require('lodash');
const numeral = require('numeral');

class OperationService {
  private listItem: Value[] = [];
  private listItemPreview: Value[] = [];
  private listItemRawData: Value[] = [];

  public async getAll(): Promise<ConfigFile[]> {
    const configFileRepository = getRepository(ConfigFile);
    return await configFileRepository.find();
  }

  public previewListPowerGeneration(list: Value[]) {
    this.listItemPreview = list;
    return this;
  }

  public calculatedPowerGen(
    list: Value[],
    size: number,
    type: string,
    unit: string
  ) {
    if (unit === 'kWh') {
      this.calculatedPowerGenTypeKWh(list);
    } else {
      this.calculatedPowerGenTypeW(list);
    }
    return this;
  }

  public calculatedPowerGenTypeKWh(list: Value[]) {
    this.listItem = list;
    return this;
  }

  public calculatedPowerGenTypeW(list: Value[]) {
    this.listItem = list;
    return this;
  }

  public calculatedRadiation(
    size: number,
    type: string,
    Config: ConfigFile,
    plantName: string,
    date: string,
    rawData: any
  ) {
    console.log(Config);
    // let tempList:any = []
    // if(listConfig.length !== 0) {
    //   // TODO: read config by index
    //   for (const itemConfig of listConfig) {
    //     console.log(itemConfig)
    //     if(itemConfig.unit === 'kWh') {
    //         // const result:Value[] =  excelExtract();
    //     } else {
    //
    //     }
    //   }
    //
    // } else {
    //   throw new Error('configFile not found')
    // }
    return this;
  }
  public getValueByConfigRadiation(list: Value[], config: any) {
    return list;
  }
  public calculatedRadiationTypeW(list: Value[]) {
    return this;
  }
  public calculatedRadiationTypeKWh(list: Value[]) {
    return this;
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
          let excelValuePowerGeneration: Value[] = excelExtract(
            configPWR[0].configFileMappings[0].sheet,
            file[0].name.includes(Type.PWR_JP) ? file[0].data : file[1].data, 
            configPWR[0].configFileMappings[0].rowStart,
            configPWR[0].configFileMappings[0].rowStop,
            configPWR[0].configFileMappings[0].columnPoint,
            configPWR[0].configFileFormatDate.columnPoint,
            configPWR[0].configFileFormatDate.datetimeFormat,
            date,
            configPWR[0].plantName,
            configPWR[0].configFileMappings[0].key
          );
          console.log(excelValuePowerGeneration);
        } else {
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

          let excelValuePowerGeneration: Value[] = excelExtract(
            configPWR[0].configFileMappings[0].sheet,
            file[0].data,
            configPWR[0].configFileMappings[0].rowStart,
            configPWR[0].configFileMappings[0].rowStop,
            configPWR[0].configFileMappings[0].columnPoint,
            configPWR[0].configFileFormatDate.columnPoint,
            configPWR[0].configFileFormatDate.datetimeFormat,
            date,
            configPWR[0].plantName,
            configPWR[0].configFileMappings[0].key
          );

          let excelValuePowerGeneration2: Value[] = excelExtract(
            configPWR2[0].configFileMappings[0].sheet,
            file[1].data,
            configPWR2[0].configFileMappings[0].rowStart,
            configPWR2[0].configFileMappings[0].rowStop,
            configPWR2[0].configFileMappings[0].columnPoint,
            configPWR2[0].configFileFormatDate.columnPoint,
            configPWR2[0].configFileFormatDate.datetimeFormat,
            date,
            configPWR2[0].plantName,
            configPWR2[0].configFileMappings[0].key
          );

          console.log(excelValuePowerGeneration);
          console.log(excelValuePowerGeneration2);
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

        // TODO: read file by config type powerGeneration
        let excelValuePowerGeneration: Value[] = excelExtract(
          configPWR[0].configFileMappings[0].sheet,
          file[0].data,
          configPWR[0].configFileMappings[0].rowStart,
          configPWR[0].configFileMappings[0].rowStop,
          configPWR[0].configFileMappings[0].columnPoint,
          configPWR[0].configFileFormatDate.columnPoint,
          configPWR[0].configFileFormatDate.datetimeFormat,
          date,
          configPWR[0].plantName,
          configPWR[0].configFileMappings[0].key
        );

        // console.log(excelValuePowerGeneration)
        // TODO: calculated case Power generation and get Preview List
        const sizeOfPowerGeneration = configPWR[0].configFileMappings.length;
        const unitPowerGeneration = configPWR[0].configFileMappings[0].unit;

        this.calculatedPowerGen(
          excelValuePowerGeneration,
          sizeOfPowerGeneration,
          Type.PWR,
          unitPowerGeneration
        ).previewListPowerGeneration(excelValuePowerGeneration);

        // TODO: calculated case Radiation and get Preview List
        const sizeOfRadiation = configRADIATION[0].configFileMappings.length;
        this.calculatedRadiation(
          sizeOfRadiation,
          Type.RADIATION,
          configRADIATION[0],
          configRADIATION[0].plantName,
          date,
          file[0].data
        );
        //   .previewList(excelValuePowerGeneration)
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

      console.log('test check 1 2');
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
    let configPlantName = await configFileRepository.find({
      plantName: plant
    });
    return configPlantName;
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
          .andWhere('mapping.key like  :key', { key: `${key}%` })
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
    //  console.log(XLSX.utils.format_cell(sheet[dateKub]))
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
