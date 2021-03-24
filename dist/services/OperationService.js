"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationService = void 0;
const typeorm_1 = require("typeorm");
const configFile_entity_1 = require("../entity/configFile.entity");
const dayjs = require('dayjs');
const XLSX = require('xlsx');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const ReadFile_1 = require("../utils/ReadFile");
dayjs.extend(customParseFormat);
const _ = require('lodash');
const numeral = require('numeral');
class OperationService {
    constructor() {
        this.listItemRadiation = [];
        this.listItemPowerGeneration = [];
        this.listItemRadiationPreview = [];
        this.listItemPowerGenerationPreview = [];
    }
    async getAll() {
        const configFileRepository = typeorm_1.getRepository(configFile_entity_1.ConfigFile);
        return await configFileRepository.find();
    }
    calculatedPowerGenMultipleFile(config, type, date, rawData) {
        let tempList = [];
        if (config[0].configFileMappings.length !== 0) {
            for (const itemConfig of config[0].configFileMappings) {
                console.log(itemConfig.unit);
                if (itemConfig.unit === 'kWh') {
                    let result = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, config[0].configFileFormatDate.columnPoint, config[0].configFileFormatDate.datetimeFormat, date, config[0].plantName, itemConfig.key);
                    console.log("result: Config", itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint);
                    tempList.push(this.calculatedPowerGenMultipleFileTypeKWh(result));
                }
                else {
                    let result = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, config[0].configFileFormatDate.columnPoint, config[0].configFileFormatDate.datetimeFormat, date, config[0].plantName, itemConfig.key);
                    console.log("result: Config", itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint);
                    tempList.push(this.calculatedPowerGenMultipleFileTypeKWhAVG(result));
                }
            }
            let listValue = [];
            for (const value of tempList) {
                listValue = [...listValue, ...value];
            }
            this.listItemPowerGenerationPreview = listValue;
            this.listItemPowerGeneration = listValue;
            return this;
        }
        else {
            throw new Error('config not found');
        }
    }
    calculatedPowerGen(config, type, date, rawData) {
        let tempList = [];
        if (config[0].configFileMappings.length !== 0) {
            for (const itemConfig of config[0].configFileMappings) {
                if (itemConfig.unit === 'kWh') {
                    let result = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, config[0].configFileFormatDate.columnPoint, config[0].configFileFormatDate.datetimeFormat, date, config[0].plantName, itemConfig.key);
                    if (result.length <= 24) {
                        tempList.push(this.calculatedPowerGenTypeKWh(result));
                    }
                    else {
                        tempList.push(this.calculatedPowerGenCaseMinTypeKWh(result));
                    }
                }
                else {
                    let result = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, config[0].configFileFormatDate.columnPoint, config[0].configFileFormatDate.datetimeFormat, date, config[0].plantName, itemConfig.key);
                    if (result.length <= 24) {
                        tempList.push(this.calculatedPowerGenTypeKWh(result));
                    }
                    else {
                        tempList.push(this.calculatedPowerGenCaseMinTypeKWh(result));
                    }
                }
            }
            let listValue = [];
            for (const value of tempList) {
                listValue = [...listValue, ...value];
            }
            this.listItemPowerGenerationPreview = listValue;
            this.listItemPowerGeneration = listValue;
            return this;
        }
        else {
            throw new Error('config not found');
        }
    }
    calculatedPowerGenTypeKWh(list) {
        return list;
    }
    calculatedPowerGenCaseMinTypeKWh(list) {
        const tempList = this.groupPowerGenToHour(list);
        const listResult = this.calculatedPowerGenByMin(tempList);
        return listResult;
    }
    calculatedPowerGenMultipleFileTypeKWh(list) {
        const listGroupByHour = this.groupRadiationToHour(list);
        const listResult = this.calculatedPowerGenCaseMultiFileByHour(listGroupByHour);
        return listResult;
    }
    calculatedPowerGenMultipleFileTypeKWhAVG(list) {
        const listGroupByHour = this.groupRadiationToHour(list);
        const listResult = this.calculatedPowerGenCaseMultiFileByHour(listGroupByHour);
        return listResult;
    }
    calculatedPowerGenByMin(list) {
        let tempList = [];
        for (let i = 0; i < list.length; i++) {
            const sumPowerGeneration = list[i].map((v) => v.powerGeneration)
                .reduce((a, b) => a + b, 0);
            list[i][0].powerGeneration = sumPowerGeneration / list[i].map((v) => v.powerGeneration).length;
            tempList.push(list[i][0]);
        }
        return tempList;
    }
    calculatedRadiationMultipleFileSameName(Config, type, date, rawData) {
    }
    calculatedRadiation(Config, type, date, rawData) {
        let tempList = [];
        if (Config[0].configFileMappings.length !== 0) {
            for (const itemConfig of Config[0].configFileMappings) {
                if (itemConfig.unit === 'kWh') {
                    let result = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, Config[0].configFileFormatDate.columnPoint, Config[0].configFileFormatDate.datetimeFormat, date, Config[0].plantName, itemConfig.key);
                    tempList.push(this.calculatedRadiationTypeKWh(result));
                }
                else {
                    let result = excelExtract(itemConfig.sheet, rawData, itemConfig.rowStart, itemConfig.rowStop, itemConfig.columnPoint, Config[0].configFileFormatDate.columnPoint, Config[0].configFileFormatDate.datetimeFormat, date, Config[0].plantName, itemConfig.key);
                    tempList.push(this.calculatedRadiationTypeW(result));
                }
            }
            let listValue = [];
            for (const value of tempList) {
                listValue = [...listValue, ...value];
            }
            this.listItemRadiationPreview = listValue;
            this.calculatedValueOfRadiation(tempList[0], Config[0].configFileMappings.length, listValue);
            return this;
        }
        else {
            throw new Error('config not found');
        }
    }
    calculatedValueOfRadiation(list, size, totalArray) {
        let resultList = [];
        if (list.length !== 0) {
            list.forEach(v => {
                let findByTime = totalArray.filter((d) => v.dateTime === d.dateTime);
                if (findByTime) {
                    let total = findByTime
                        .map((v) => v.radiation)
                        .reduce((a, b) => (a + b), 0);
                    v.radiation = (total / size);
                    resultList.push(v);
                }
                else {
                    resultList.push(v);
                }
            });
            this.listItemRadiation = resultList;
            return this;
        }
        else {
            throw new Error("no list by config 2");
        }
    }
    calculatedValueAVGOfPowerGen(list, size, totalArray) {
        let resultList = [];
        if (list.length !== 0) {
            list.forEach(v => {
                let findByTime = totalArray.filter((d) => v.dateTime === d.dateTime);
                if (findByTime) {
                    let total = findByTime
                        .map((v) => v.radiation)
                        .reduce((a, b) => (a + b), 0);
                    v.radiation = (total / size);
                    resultList.push(v);
                }
                else {
                    resultList.push(v);
                }
            });
            this.listItemRadiation = resultList;
            return this;
        }
        else {
            throw new Error("no list by config 2");
        }
    }
    calculatedPowerGenCaseMultiFileByHour(list) {
        let tempList = [];
        for (let i = 0; i < list.length; i++) {
            const sumPowerGeneration = list[i].map((v) => v.powerGeneration)
                .reduce((a, b) => a + b, 0);
            list[i][0].powerGeneration = sumPowerGeneration;
            tempList.push(list[i][0]);
        }
        return tempList;
    }
    calculatedRadiationTypeW(list) {
        if (list.length === 0) {
            throw new Error("List not found");
        }
        let tempListGroupByHour = this.groupRadiationToHour(list);
        const listResult = this.calculatedRadiationByHour(tempListGroupByHour);
        return listResult;
    }
    groupRadiationToHour(list) {
        const hour = 24;
        let tempList = [];
        const formatDate = `2021-01-01`;
        for (let i = 0; i < hour; i++) {
            const findHours = list.filter((d) => dayjs(`${formatDate} ${i}:00`).get('h') === dayjs(d.dateTime).get('h'));
            if (findHours) {
                tempList.push(findHours);
            }
        }
        return tempList;
    }
    groupPowerGenToHour(list) {
        const hour = 24;
        let tempList = [];
        const formatDate = `2021-01-01`;
        for (let i = 0; i < hour; i++) {
            const findHours = list.filter((d) => dayjs(`${formatDate} ${i}:00`).get('h') === dayjs(d.dateTime).get('h'));
            if (findHours.length !== 0) {
                tempList.push(findHours);
            }
            else {
                const getTemp = list.filter((d) => d !== null);
                tempList.push({
                    id: getTemp[0].plantName +
                        '-' +
                        dayjs(getTemp[0].dateTime, 'YYYY-MM-DD').format('YYYYMMDD') +
                        dayjs(`${i}:00`).format('HHmm'),
                    plantName: getTemp[0].plantName,
                    dateTime: "",
                    radiation: 0,
                    powerGeneration: 0,
                    type: getTemp[0].plantName
                });
            }
        }
        return tempList;
    }
    calculatedRadiationTypeKWh(list) {
        return list;
    }
    calculatedRadiationByHour(list) {
        let tempList = [];
        for (let i = 0; i < list.length; i++) {
            const sumRadiation = list[i].map((v) => v.radiation)
                .reduce((a, b) => a + b, 0) / list[i].length / 1000;
            list[i][0].radiation = sumRadiation;
            tempList.push(list[i][0]);
        }
        return tempList;
    }
    checkSameFileName(file1, file2) {
        let fileOne = file1.split('_', 1);
        let fileTwo = file2.split('_', 1);
        return fileOne[0] === fileTwo[0];
    }
    async uploadFile(file, date) {
        try {
            if (file.length === 2) {
                const fileList = ReadFile_1.CheckFileType(file[0]);
                const fileList2 = ReadFile_1.CheckFileType(file[1]);
                if (this.checkSameFileName(fileList.name, fileList2.name)) {
                    const getConfig = await Promise.all([
                        this.getConfigByPlantNameAndKeyAndFilename(fileList.name, Type.PWR, Type.PWR_JP),
                        this.getConfigByPlantNameAndKeyAndFilename(fileList2.name, Type.RADIATION, Type.RADIATION_JP)
                    ]);
                    const configPWR = getConfig[0];
                    const configRADIATION = getConfig[1];
                    const filePwr = file[0].name.includes(Type.PWR_JP) ? file[0].data : file[1].data;
                    const fileRadiation = file[1].name.includes(Type.RADIATION_JP) ? file[1].data : file[0].data;
                    this.calculatedPowerGenMultipleFile(configPWR, Type.PWR, date, filePwr);
                    return this;
                }
                else {
                    const getConfig = await Promise.all([
                        this.getConfigByPlantNameAndKey(fileList.name, Type.PWR),
                        this.getConfigByPlantNameAndKey(fileList.name, Type.RADIATION),
                        this.getConfigByPlantNameAndKey(fileList2.name, Type.PWR),
                        this.getConfigByPlantNameAndKey(fileList2.name, Type.RADIATION)
                    ]);
                    const configPWR = getConfig[0];
                    const configRADIATION = getConfig[1];
                    const configPWR2 = getConfig[2];
                    const configRADIATION2 = getConfig[3];
                    this.calculatedPowerGenMultipleFile(configPWR2, Type.PWR, date, file[0].data);
                    let excelValuePowerGeneration = excelExtract(configPWR[0].configFileMappings[0].sheet, file[0].data, configPWR[0].configFileMappings[0].rowStart, configPWR[0].configFileMappings[0].rowStop, configPWR[0].configFileMappings[0].columnPoint, configPWR[0].configFileFormatDate.columnPoint, configPWR[0].configFileFormatDate.datetimeFormat, date, configPWR[0].plantName, configPWR[0].configFileMappings[0].key);
                    let excelValuePowerGeneration2 = excelExtract(configPWR2[0].configFileMappings[0].sheet, file[1].data, configPWR2[0].configFileMappings[0].rowStart, configPWR2[0].configFileMappings[0].rowStop, configPWR2[0].configFileMappings[0].columnPoint, configPWR2[0].configFileFormatDate.columnPoint, configPWR2[0].configFileFormatDate.datetimeFormat, date, configPWR2[0].plantName, configPWR2[0].configFileMappings[0].key);
                    return this;
                }
            }
            else if (file.length === 1) {
                const fileList = ReadFile_1.CheckFileType(file[0]);
                const getConfig = await Promise.all([
                    this.getConfigByPlantNameAndKey(fileList.name, Type.PWR),
                    this.getConfigByPlantNameAndKey(fileList.name, Type.RADIATION)
                ]);
                const configPWR = getConfig[0];
                const configRADIATION = getConfig[1];
                this.calculatedPowerGen(configPWR, Type.PWR, date, file[0].data);
                this.calculatedRadiation(configRADIATION, Type.RADIATION, date, file[0].data);
                return this;
            }
            else {
                throw new Error('invalid file');
            }
        }
        catch (e) {
            console.log(e.stack);
            throw new Error(e.message);
        }
    }
    async upload(request, date) {
        const data = request.files;
        console.log(data.files);
        let values = [];
        let multiFile = checkMultipleFile(data.files);
        if (multiFile === undefined || multiFile.length === 0) {
        }
        else {
            for (const file of multiFile) {
                const plant = splitString(file.name, '_');
                console.log(file.name);
                console.log(plant[0]);
                const config = await this.getConfigByPlantName(plant[0]);
                console.log(config.length);
                console.log('==================================END FILE===================================');
                config.forEach(async (item, index) => {
                    console.log(item.plantName);
                    console.log(item.configFileFormatDate.datetimeFormat);
                    item.configFileMappings.forEach((value) => {
                        console.log(value.key);
                        console.log(value.filename);
                        console.log(file.name);
                        if (value.filename) {
                            let checkFilename = file.name.includes(value.filename);
                            console.log(checkFilename);
                            if (!checkFilename) {
                                return;
                            }
                        }
                        let excelValue = excelExtract(value.sheet, file.data, value.rowStart, value.rowStop, value.columnPoint, item.configFileFormatDate.columnPoint, item.configFileFormatDate.datetimeFormat, date, item.plantName, value.key);
                        values = [...values, ...excelValue];
                    });
                });
            }
            console.log('test check 1 2');
            let summed = _(values)
                .groupBy('id')
                .map((objs, key) => {
                return {
                    id: key,
                    sumPwr: _.sumBy(objs, 'powerGeneration'),
                    sumRadiation: _.divide(_.sumBy(objs, 'radiation', 'radiation2', 'radiation3'), 2).toFixed(2)
                };
            })
                .value();
            console.log(summed);
        }
        return (_.chain(values)
            .groupBy('type')
            .map((value, key) => ({ type: key, datas: value }))
            .value());
    }
    async getConfigByPlantName(plant) {
        const configFileRepository = typeorm_1.getRepository(configFile_entity_1.ConfigFile);
        let configPlantName = await configFileRepository.find({
            plantName: plant
        });
        return configPlantName;
    }
    async getConfigByPlantNameAndKey(filename, key) {
        try {
            if (filename && key) {
                const plant = filename.split('_', 1);
                const result = await typeorm_1.getRepository(configFile_entity_1.ConfigFile)
                    .createQueryBuilder('configFile')
                    .leftJoinAndSelect('configFile.configFileMappings', 'mapping')
                    .leftJoinAndSelect('configFile.configFileFormatDate', 'mappingDate')
                    .where('configFile.plantName = :name', { name: plant })
                    .andWhere('mapping.key = :key', { key: key })
                    .getMany()
                    .then((response) => response)
                    .catch((error) => error);
                return result;
            }
            else {
                const error = new Error('invalid input');
                throw error;
            }
        }
        catch (e) {
            throw e;
        }
    }
    async getConfigByPlantNameAndKeyAndFilename(filename, key, filenameType) {
        try {
            if (filename && key && filenameType) {
                const plant = filename.split('_', 1);
                filenameType = plant + '_' + filenameType;
                const result = await typeorm_1.getRepository(configFile_entity_1.ConfigFile)
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
            }
            else {
                const error = new Error('invalid input');
                throw error;
            }
        }
        catch (e) {
            throw e;
        }
    }
}
const excelExtract = (sheetNum, data, rowStart, rowStop, columnValue, columnDate, dateFormat, date, plantName, key) => {
    console.log(sheetNum);
    const workBook = XLSX.read(data, { dateNF: 'M/d/YY HH:mm' });
    const sheetName = workBook.SheetNames[sheetNum - 1];
    const sheet = workBook.Sheets[sheetName];
    columnDate = columnDate - 1;
    rowStart = rowStart - 1;
    columnValue = columnValue - 1;
    let sheetRef = XLSX.utils.decode_range(sheet['!ref']);
    if (!rowStop) {
        rowStop = sheetRef.e.r;
    }
    let values = [];
    for (let i = rowStart; i < rowStop; i++) {
        let cell_address = { c: columnValue, r: i };
        let data = XLSX.utils.encode_cell(cell_address);
        let cell_date = { c: columnDate, r: i };
        let dateKub = XLSX.utils.encode_cell(cell_date);
        let value = {
            id: plantName +
                '-' +
                dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD') +
                dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).format('HHmm'),
            plantName: plantName,
            dateTime: dayjs(date +
                dayjs(XLSX.utils.format_cell(sheet[dateKub]), dateFormat).format('HH:mm'), 'YYYY-MM-DDHH:mm').format('YYYY-MM-DD HH:mm'),
            radiation: key !== Type.PWR
                ? numeral(XLSX.utils.format_cell(sheet[data]))._value
                : 0,
            powerGeneration: key === Type.PWR
                ? numeral(XLSX.utils.format_cell(sheet[data]))._value
                : 0,
            type: key
        };
        values.push(value);
    }
    const dateString = dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD');
    console.log('Date: ', plantName + '-' + dateString);
    console.log('_____________________________________________________');
    return values;
};
const splitString = (value, pattern) => value.split(pattern);
const checkMultipleFile = (value) => {
    let oneFile = [];
    let multiFile = [];
    if (Array.isArray(value)) {
        console.log('MULTI FIELELE');
        console.log(value);
        multiFile = value;
    }
    else {
        console.log('ONEEE FIELELE');
        console.log(value);
        oneFile = value;
        multiFile.push(oneFile);
    }
    return multiFile;
};
var Type;
(function (Type) {
    Type["RADIATION"] = "Radiation";
    Type["PWR"] = "PowerGeneration";
    Type["GROUPPWR"] = "GroupPowerGeneration";
    Type["GROUPRADIATION"] = "GroupRadiation";
    Type["PWR_JP"] = "\u96FB\u529B";
    Type["RADIATION_JP"] = "\u6C17\u8C61";
})(Type || (Type = {}));
exports.operationService = new OperationService();
