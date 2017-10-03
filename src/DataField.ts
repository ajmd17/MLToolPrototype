import { DataType, Value } from './Typedefs';

abstract class DataField {
  constructor(public dataType: DataType) {}

  validateSelf(): void {
    if (['string', 'number'].indexOf(typeof this.dataType) === -1) {
      throw new Error('invalid data type');
    }
  }

  validateForValue(value: Value): void {
    if (typeof value !== this.dataType) {
      throw new Error(`Expected type '${this.dataType}', got '${typeof value}'`);
    }
  }
}

export default DataField;