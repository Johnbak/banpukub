import { FileUpload } from '../src/types/FileUpload';

const oneFile = [['Awaji'], ['NariAizu'], ['Kurokawa'], ['Takeo'], ['Tenzan']];

const twoFileSameName = [
  ['H1'],
  ['H2'],
  ['S1'],
  ['S2'],
  ['Mukawa'],
  ['Katashina']
];

const twoFileNotSameName = [
  ['Hino1', 'Hino2'],
  ['Muroran1', 'Muroran2']
];

module.exports = {
  add: (a: number, b: number) => a + b,
  checkFileType: (file: FileUpload) => null,
  checkSameFileName: (file1: string, file2: string) => false,
  checkOneFile: (file: string) => {
    for (var val of oneFile) {
      if (val.find((val) => val === file)) {
        return true;
      }
    }
    return false;
  },
  checkTwoFileSameName: (file: string, file2: string) => {
    for (var val of twoFileSameName) {
      if (val.find((val) => val === file) && val.find((val) => val === file2)) {
        return true;
      }
    }
    return false;
  },
  checkTwoFileNotSameName: (file: string, file2: string) => {
    for (var val of twoFileNotSameName) {
      if (
        val.find((val) => val === file) &&
        val.find((val) => val === file2) &&
        file !== file2
      ) {
        return true;
      }
    }
    return false;
  }
};
