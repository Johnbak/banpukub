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
  private listItemRadiation: Value[] = [];
  private listItemPowerGeneration: Value[] = [];
  private listItemRadiationPreview: Value[] = [];
  private listItemPowerGenerationPreview: Value[] = [];

  public async getAll(): Promise<ConfigFile[]> {
    const configFileRepository = getRepository(ConfigFile);
    return await configFileRepository.find();
  }


  public calculatedPowerGen(config:ConfigFile[], type:string, date: string, rawData: any) {
    let tempList: any = [];
    if(config[0].configFileMappings.length !== 0) {
      // TODO: read config by index
      for (const itemConfig of config[0].configFileMappings) {
        // TODO: check unit
        console.log(itemConfig.unit)
        if (itemConfig.unit === 'kWh') {
          // TODO: get value from CSV || EXEL
          let result: Value [] = excelExtract(
            itemConfig.sheet,
            rawData,
            itemConfig.rowStart,
            itemConfig.rowStop,
            itemConfig.columnPoint,
            config[0].configFileFormatDate.columnPoint,
            config[0].configFileFormatDate.datetimeFormat,
            date,
            config[0].plantName,
            itemConfig.key)
          tempList.push(this.calculatedPowerGenTypeKWh(result))
        }
      }
      // TODO: merge array
      let listValue:Value[] = [];
      for (const value of tempList) {
        listValue = [...listValue, ...value]
      }
      this.listItemPowerGenerationPreview = listValue;
      this.listItemPowerGeneration = listValue;
      return this;
    } else {
      throw new Error('config not found');
    }
  }

  public calculatedPowerGenTypeKWh(list: Value[]) {
    return list;
  }

  public calculatedRadiationMultipleFileSameName(Config: ConfigFile[], type: string, date: string, rawData: any) {
    let tempList: any = [];
    if (Config[0].configFileMappings.length !== 0) {
      // TODO: read config by index1
      for (const itemConfig of Config[0].configFileMappings) {
        if (itemConfig.unit === 'kWh') {
          // TODO: get value from CSV || EXEL
          let result: Value [] = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, Config[0].configFileFormatDate.columnPoint, Config[0].configFileFormatDate.datetimeFormat, date, Config[0].plantName, itemConfig.key);

          // TODO: push to List
          tempList.push(this. calculatedRadiationTypeKWhMultipleFile(result));
        } else {
          // TODO: get value from CSV || EXEL
          //let result: Value [] = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, Config[0].configFileFormatDate.columnPoint, Config[0].configFileFormatDate.datetimeFormat, date, Config[0].plantName, itemConfig.key);
        }
      }
    

       // TODO: merge array
       let listValue:Value[] = [];
       for (const value of tempList) {
         listValue = [...listValue, ...value]
       }

       // TODO: getList Preview Radiation
      this.listItemRadiationPreview = listValue;
      console.log("log Test")
      console.log(Config[0].configFileMappings.length)
      console.log(tempList[0].length)
      console.log(listValue.length)
      console.log(listValue)
         // TODO: calculate Radiation
         this.calculatedValueOfRadiation(tempList[0], Config[0].configFileMappings.length, listValue);
         return this;
    }else{
      throw new Error('config not found');
    }
  }

  public calculatedRadiation(Config: ConfigFile[], type: string, date: string, rawData: any) {
    let tempList: any = [];
    if (Config[0].configFileMappings.length !== 0) {
      // TODO: read config by index1
      for (const itemConfig of Config[0].configFileMappings) {
        if (itemConfig.unit === 'kWh') {
          // TODO: get value from CSV || EXEL
          let result: Value [] = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, Config[0].configFileFormatDate.columnPoint, Config[0].configFileFormatDate.datetimeFormat, date, Config[0].plantName, itemConfig.key);
          // TODO: push to List
          tempList.push(this.calculatedRadiationTypeKWh(result));
        } else {
          // TODO: get value from CSV || EXEL
          let result: Value [] = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, Config[0].configFileFormatDate.columnPoint, Config[0].configFileFormatDate.datetimeFormat, date, Config[0].plantName, itemConfig.key);
          // TODO: convert to Unit KWh and push to List
          tempList.push(this.calculatedRadiationTypeW(result));
        }
      }
      // TODO: merge array
      let listValue:Value[] = [];
      for (const value of tempList) {
        listValue = [...listValue, ...value]
      }

      // TODO: getList Preview Radiation
      this.listItemRadiationPreview = listValue;

      // TODO: calculate Radiation
      this.calculatedValueOfRadiation(tempList[0], Config[0].configFileMappings.length, listValue);
      return this;

    } else {
      throw new Error('config not found');
    }
  }
  public calculatedValueOfRadiation(list:Value[], size:number, totalArray:Value[]) {
    let resultList: Value[] = [];
    if(list.length !== 0 ) {
      list.forEach(v => {
        let findByTime = totalArray.filter((d) => v.dateTime === d.dateTime);
        if (findByTime) {
          let total = findByTime
            .map((v) => v.radiation)
            .reduce((a, b) => (a + b), 0)
          v.radiation = (total/size);
          resultList.push(v);
        } else {
          resultList.push(v);
        }
      });
      this.listItemRadiation = resultList;
      return this;
    } else {
      throw new Error("no list by config 2");
    }

  }

  public calculatedRadiationTypeW(list: Value[]) {
    // TODO check empty array
    if(list.length === 0) {
      //TODO: list not found calculatedRadiationTypeW
      throw new Error("List not found")
    }
    // TODO : GROUP By hour
    let tempListGroupByHour = this.groupRadiationToHour(list);

    // TODO: sum radiation by hour
    const listResult =  this.calculatedRadiationByHour(tempListGroupByHour);

    return listResult;
  }
  public groupRadiationToHour (list: Value[]) {
    const hour:number = 24;
    let tempList = [];
    const formatDate:string = `2021-01-01`; // ignore value of day finally get only hour

  // TODO: Group by hour by start at 0:00 to 23:55
    for (let i = 0; i < hour ; i++) {
      const findHours = list.filter((d) => dayjs(`${formatDate} ${i}:00`).get('h') === dayjs(d.dateTime).get('h') )
      if(findHours.length !== 0) {
        tempList.push(findHours)
      }else{
        console.log(i)
        const getTemp = list.filter((d:Value) => d !== null);
        tempList.push(
          [{
            id:  getTemp[0].plantName +
              '-' +
              dayjs(getTemp[0].dateTime, 'YYYY-MM-DD').format('YYYYMMDD') +
              dayjs(`${i}:00`,'HH:mm').format('HHmm'),
            plantName: getTemp[0].plantName,
            dateTime: dayjs(getTemp[0].dateTime).format('YYYY-MM-DD')+" "+`${i}:00`,
            radiation: 0,
            powerGeneration: 0,
            type: getTemp[0].plantName
          }]
        )
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
    if(list.length === 0) {
      //TODO: list not found calculatedRadiationTypeW
      throw new Error("List not found")
    }

    // TODO : GROUP By hour
    let tempListGroupByHour = this.groupRadiationToHour(list)

    // TODO: sum radiation by hour
    const listResult =  this.calculatedRadiationByHour(tempListGroupByHour);
    return listResult;
  }

  public calculatedRadiationByHour(list:any) {
    let tempList = [];
    for (let i = 0; i < list.length ; i++) {
      const sumRadiation = list[i].map((v:Value)=> v.radiation)
        .reduce((a:any, b:any) => a+b, 0) / list[i].length/1000
      list[i][0].radiation = sumRadiation;
      list[i][0].dateTime = dayjs(list[i][0].dateTime).startOf('h').format('YYYY-MM-DD HH:mm')
      tempList.push(list[i][0])
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

          const filePwr:any = file[0].name.includes(Type.PWR_JP) ? file[0].data : file[1].data;

          const fileRadiation:any = file[1].name.includes(Type.RADIATION_JP) ? file[1].data : file[0].data;

          // console.log(fileRadiation)

          this.calculatedPowerGen(configPWR, Type.PWR, date, filePwr);

          this.calculatedRadiationMultipleFileSameName(configRADIATION, Type.RADIATION, date, fileRadiation);

          return this
          // let excelValuePowerGeneration: Value[] = excelExtract(
          //   configPWR[0].configFileMappings[0].sheet,
          //   file[0].name.includes(Type.PWR_JP) ? file[0].data : file[1].data, 
          //   configPWR[0].configFileMappings[0].rowStart,
          //   configPWR[0].configFileMappings[0].rowStop,
          //   configPWR[0].configFileMappings[0].columnPoint,
          //   configPWR[0].configFileFormatDate.columnPoint,
          //   configPWR[0].configFileFormatDate.datetimeFormat,
          //   date,
          //   configPWR[0].plantName,
          //   configPWR[0].configFileMappings[0].key
          // );
          // console.log(excelValuePowerGeneration);
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

        // TODO: calculated case Power Gen and get Preview List
        this.calculatedPowerGen(configPWR, Type.PWR, date, file[0].data);

        // TODO: calculated case Radiation and get Preview List
        this.calculatedRadiation(configRADIATION, Type.RADIATION, date, file[0].data);

        return this;
      } else {
        throw new Error('invalid file');
      }
    } catch (e) {
      console.log(e.stack)
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
        dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).format('HHmm'),
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
