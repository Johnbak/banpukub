import { ConfigFile } from '../entity/configFile.entity';

export interface OperationInterface {
     getConfigByPlantNameAndKey(): ConfigFile[];
     getConfigByPlantNameAndKeyAndFilename(): ConfigFile[];
}