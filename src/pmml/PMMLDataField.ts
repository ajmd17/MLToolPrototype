import DataField from '../DataField';
import { DataType, OpType, Value } from '../Typedefs';

export default class PMMLDataField extends DataField {
  public possibleValues?: Value[];
  public opType: OpType;

  constructor(opts: { dataType: DataType, possibleValues?: Value[], opType: OpType }) {
    super(opts.dataType);
    this.opType = opts.opType;
    this.possibleValues = opts.possibleValues;
  }

  validateSelf() {
    super.validateSelf();

    if (this.opType === null || this.opType === undefined) {
      throw new Error('opType not defined');
    }
  }

  validateForValue(value: Value) {
    super.validateForValue(value);

    if (this.opType == OpType.CATEGORICAL) {
      if (this.possibleValues.indexOf(value) === -1) {
        throw new Error(`'${String(value)}' is not a valid value, expected one of: ${this.possibleValues.map(x => `'${x}'`).join(', ')}`);
      }
    }
  }
}