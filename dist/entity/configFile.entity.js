"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFile = void 0;
const typeorm_1 = require("typeorm");
const configFileMapping_entity_1 = require("./configFileMapping.entity");
const configFileFormatDate_entity_1 = require("./configFileFormatDate.entity");
let ConfigFile = class ConfigFile {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn({ name: 'id' }),
    __metadata("design:type", Number)
], ConfigFile.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'plant_name' }),
    __metadata("design:type", String)
], ConfigFile.prototype, "plantName", void 0);
__decorate([
    typeorm_1.Column({ name: 'format_file' }),
    __metadata("design:type", String)
], ConfigFile.prototype, "formatFile", void 0);
__decorate([
    typeorm_1.Column({ name: 'delimiter' }),
    __metadata("design:type", String)
], ConfigFile.prototype, "delimiter", void 0);
__decorate([
    typeorm_1.Column({ name: 'group_plant' }),
    __metadata("design:type", String)
], ConfigFile.prototype, "groupPlant", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    typeorm_1.Column({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConfigFile.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.OneToMany((type) => configFileMapping_entity_1.ConfigMapping, (configmapping) => configmapping.configFile, { cascade: ['insert', 'update'], eager: true }),
    __metadata("design:type", Array)
], ConfigFile.prototype, "configFileMappings", void 0);
__decorate([
    typeorm_1.OneToOne(() => configFileFormatDate_entity_1.ConfigDate, (configDate) => configDate.configfile, {
        cascade: ['insert', 'update'],
        eager: true
    }),
    __metadata("design:type", configFileFormatDate_entity_1.ConfigDate)
], ConfigFile.prototype, "configFileFormatDate", void 0);
ConfigFile = __decorate([
    typeorm_1.Entity({
        name: 'enigma_config_file'
    })
], ConfigFile);
exports.ConfigFile = ConfigFile;
