import DataField from './DataField';
import { JSONObject, OpType, Value } from './Typedefs';
import ModelSchema from './ModelSchema';
import S3StoredModel from './S3StoredModel';

abstract class Model<T extends DataField> implements S3StoredModel {
  constructor(public schema: ModelSchema<T>, public key: string) {}

  abstract merge(other: Model<T>): Model<T>;

  serialize(): JSONObject {
    return {
      schema: this.schema,
      key: this.key
    };
  }
}

export default Model;