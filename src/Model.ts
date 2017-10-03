import DataField from './DataField';
import { JSONObject, OpType, Value } from './Typedefs';
import ModelSchema from './ModelSchema';

abstract class Model<T extends DataField, DataType> {
  constructor(public schema: ModelSchema<T>, public data: DataType) {}

  abstract merge(other: Model<T, DataType>): Model<T, DataType>;
  abstract serialize(): JSONObject;
}

export default Model;