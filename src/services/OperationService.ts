import { request } from 'express';
import { getRepository } from 'typeorm';
import { ConfigFile } from '../entity/configFile.entity';
const dayjs = require('dayjs');
const XLSX = require('xlsx');
var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

var _ = require('lodash');

class OperationService {
  public async getAll(): Promise<ConfigFile[]> {
    // let ccccccc = new ConfigFile();
    const configFileRepository = getRepository(ConfigFile);
    // const answer = await configFileRepository.find();
    // // console.log(answer);
    // answer.forEach((item, index) => {
    //   console.log(item.plantName);
    //   console.log(item.configFileFormatDate.datetimeFormat);
    //   item.configFileMappings.forEach((value) => {
    //     console.log(value.columnPoint);
    //     console.log(value.rowStart);
    //     console.log(value.rowStop);
    //   });
    //   console.log('==========================');
    // });
    return await configFileRepository.find();
  }

  public async upload(request: any, date: string): Promise<Value[]> {
    const data: any = request.files;
    console.log(data.files);

    let values: any = [];
    let multiFile = [];
    multiFile = checkMultipleFile(data.files);
    if (multiFile === undefined || multiFile.length === 0) {
    } else {
      for (const file of multiFile) {
        const plant = splitString(file.name, '_');
        console.log(file.name);
        console.log(plant[0]);
        const config = await this.getConfigByPlantName(plant[0]);
        console.log(config.length);
        console.log(
          '==================================END FILE==================================='
        );
        config.forEach(async (item, index) => {
          console.log(item.plantName);
          console.log(item.configFileFormatDate.datetimeFormat);
          item.configFileMappings.forEach((value) => {
            console.log(value.key);
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
  // "M/d/YY h:mm" case : Kurokawa
  const workBook = XLSX.read(data,{dateNF:"HH:mm:ss" });
  //  const workBook = XLSX.read(data,{dateNF:dateFormat, cellDates:true, cellStyles:true });
  const sheetName = workBook.SheetNames[sheetNum - 1];
  const sheet = workBook.Sheets[sheetName];

  columnDate = columnDate - 1;
  rowStart = rowStart - 1;
  columnValue = columnValue - 1;
  // rowStop = 50
  let values: Value[] = [];

  for (let i = rowStart; i < rowStop; i++) {
    let cell_address = { c: columnValue, r: i };
    let data = XLSX.utils.encode_cell(cell_address);
    let cell_date = { c: columnDate, r: i };
    let dateKub = XLSX.utils.encode_cell(cell_date);
    console.log(
      XLSX.utils.format_cell(sheet[data]) +
        '   ' +
        XLSX.utils.format_cell(sheet[dateKub]) +
        '    ' +
        dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).get('hour') +
        '    ' +
        plantName +
        '-' +
        dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD') +
        dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).format('HHmm')
    );

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
        key !== Type.PWR ? Number(XLSX.utils.format_cell(sheet[data])) : 0,
      powerGeneration:
        key === Type.PWR ? Number(XLSX.utils.format_cell(sheet[data])) : 0,
      type: key
    };

    values.push(value);
  }

  const dateString = dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD');
  console.log('Date: ', plantName + '-' + dateString);

  console.log('_____________________________________________________');
  console.log(values);
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
  GROUPRADIATION = 'GroupRadiation'
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
