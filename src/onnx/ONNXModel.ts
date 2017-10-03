import Model from '../Model';
import ONNXDataField from './ONNXDataField';
import { JSONObject } from '../Typedefs';

export default class ONNXModel extends Model<ONNXDataField, Uint8Array> {
  merge(other: ONNXModel) {
    return this;
  }

  serialize(): JSONObject {
    return {
      schema: this.schema,
      data: this.data
    };
  }
}