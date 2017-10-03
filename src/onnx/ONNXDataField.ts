import DataField from '../DataField';
import { DataType } from '../Typedefs';

export default class ONNXDataField extends DataField {
  constructor(opts: { dataType: DataType }) {
    super(opts.dataType);
  }

  /** TODO */
}