import Model from '../Model';
import ModelSchema from '../ModelSchema';
import PMMLDataField from './PMMLDataField';
import { JSONObject } from '../Typedefs';

export default class PMMLModel extends Model<PMMLDataField, string> {
  merge(other: PMMLModel) {
    return this;
  }

  serialize(): JSONObject {
    return {
      schema: this.schema,
      data: this.data
    };
  }

  static deserialize(obj: JSONObject) {
    if (obj.schema == null) {
      throw new Error("'schema' field missing from serialized JSON object");
    }

    if (obj.data == null) {
      throw new Error("'data' field missing from serialized JSON object");
    }

    if (obj.schema.shape == null) {
      throw new Error("'schema.shape' field missing from serialized JSON object");
    }

    let modelSchema = new ModelSchema<PMMLDataField>();

    for (let key in obj.schema.shape) {
      let dataField = obj.schema.shape[key];

      if (dataField.opType == null) {
        throw new Error('opType not specified for data field');
      }

      if (dataField.dataType == null) {
        throw new Error('dataType not specified for data field');
      }

      let dataFieldObj = new PMMLDataField({
        dataType: dataField.dataType,
        possibleValues: dataField.possibleValues,
        opType: dataField.opType
      });

      dataFieldObj.validateSelf();

      modelSchema.shape[key] = dataFieldObj;
    }

    return new PMMLModel(modelSchema, obj.data);
  }
}