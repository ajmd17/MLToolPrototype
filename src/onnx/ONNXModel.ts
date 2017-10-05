import Model from '../Model';
import ONNXDataField from './ONNXDataField';
import { JSONObject } from '../Typedefs';

export default class ONNXModel extends Model<ONNXDataField> {
  public static SCHEMA_EXTRACTOR_LAMBDA = 'Testing';

  merge(other: ONNXModel) {
    return this;
  }
}