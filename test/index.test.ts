const helpers = require('../src/helpers');
import { FileUpload } from '../src/types/FileUpload';

describe('check type file', () => {
  beforeEach(() => {
    // call before all test
  });

  test('read file input test', () => {
    let file: FileUpload;
    const List: String[] = ['application/vnd.ms-excel', 'text/csv'];
    //    TODO:1

    // expect(file).not.toBeNull();
    // expect(file).not.toBeUndefined();
    expect(helpers.checkFileType(file)).not.toBeUndefined();
    expect(helpers.checkFileType(file)).not.toBeNull();
    expect(helpers.checkFileType(file)).toThrow();
    expect(helpers.checkFileType(file)).toThrow('invalid file type');
    // expect(List.find(value => value === file1.mimetype))
  });

  test('checkSameFilename', () => {
    //    TODO:2
    const filename1: string = 'file1';
    const filename2: string = 'file2';
    expect(helpers.checkSameFileName(filename1, filename2)).toBeTruthy();
    expect(helpers.checkSameFileName(filename1, filename2)).toBeFalsy();
  });

  test('check file 1 , 2 correct', () => {
    //    TODO:3
    const oneFilekub = 'Awaji';
    expect(helpers.checkOneFile(oneFilekub)).toBeTruthy();

    const file1 = 'H1';
    const file2 = 'H1';
    expect(helpers.checkTwoFileSameName(file1, file2)).toBeTruthy();

    const file1NotSame = 'Hino1';
    const file2NotSame = 'Hino2';
    expect(
      helpers.checkTwoFileNotSameName(file1NotSame, file2NotSame)
    ).toBeTruthy();
  });

  test('read file input', () => {
    //    TODO:4
  });
});

describe('Test kub', () => {
  test('mock kub', () => {
    const addMock = jest.spyOn(helpers, 'add');
    // addMock.mockImplementation(() => 4);
    // // redefined implementation
    // expect(helpers.add()).toBe(4);

    // addMock.mockRestore();

    expect(helpers.add(1, 2)).toBe(3);

    // look, in contrast to jest.fn() that returns undefined by default
    // jest.spyOn() calls original implementation
    // expect(result).toBe(3);
  });
});
