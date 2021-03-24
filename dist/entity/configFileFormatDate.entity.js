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
exports.ConfigDate = void 0;
const typeorm_1 = require("typeorm");
const configFile_entity_1 = require("./configFile.entity");
let ConfigDate = class ConfigDate {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn({ name: 'id' }),
    __metadata("design:type", Number)
], ConfigDate.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'column_point' }),
    __metadata("design:type", Number)
], ConfigDate.prototype, "columnPoint", void 0);
__decorate([
    typeorm_1.Column({ name: 'datetime_format' }),
    __metadata("design:type", String)
], ConfigDate.prototype, "datetimeFormat", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    typeorm_1.Column({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConfigDate.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.OneToOne(() => configFile_entity_1.ConfigFile, {}),
    typeorm_1.JoinColumn({ name: 'config_file_id' }),
    __metadata("design:type", configFile_entity_1.ConfigFile)
], ConfigDate.prototype, "configfile", void 0);
ConfigDate = __decorate([
    typeorm_1.Entity({
        name: 'enigma_config_file_format_date'
    })
], ConfigDate);
exports.ConfigDate = ConfigDate;
