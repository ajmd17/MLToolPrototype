import InputData from './InputData';
import DataField from './DataField';
import { JSONObject, OpType, Value } from './Typedefs';
import ModelSchema from './ModelSchema';
import S3StoredModel from './S3StoredModel';

abstract class Model<T extends DataField> {
  constructor(public schema: ModelSchema<T>) {
    if (typeof schema !== 'object') {
      throw new TypeError('schema must be an object');
    }
  }

  abstract evaluate(csvData: string): Promise<JSONObject>;

  serialize(): JSONObject {
    return {
      schema: this.schema
    };
  }
}

export default Model;