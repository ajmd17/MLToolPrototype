import InputData from './InputData';
import DataField from './DataField';
import { JSONObject, OpType, Value } from './Typedefs';
import ModelSchema from './ModelSchema';
import S3StoredModel from './S3StoredModel';

abstract class Model<T extends DataField> implements S3StoredModel {
  constructor(public schema: ModelSchema<T>, public key: string) {
    if (typeof schema !== 'object') {
      throw new TypeError('schema must be an object');
    }
    if (typeof key !== 'string') {
      throw new TypeError('key must be a string');
    }
  }

  abstract evaluate(csvData: string): Promise<JSONObject>;
  abstract merge(other: Model<T>): Model<T>;

  serialize(): JSONObject {
    return {
      schema: this.schema,
      key: this.key
    };
  }
}

export default Model;