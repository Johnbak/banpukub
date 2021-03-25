import { ConfigFile } from '../../entity/configFile.entity';

export interface ConfigParameter {
  plantName:string,
  config: ConfigFile[],
  file: ArrayBuffer
}