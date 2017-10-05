import Model from '../Model';
import S3StoredModel from '../S3StoredModel';
import ModelSchema from '../ModelSchema';
import PMMLDataField from './PMMLDataField';
import { JSONObject } from '../Typedefs';

export default class PMMLModel extends Model<PMMLDataField> {
  public static SCHEMA_EXTRACTOR_LAMBDA = 'Testing';

  merge(other: PMMLModel) {
    return this;
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

    let shape: { [key: string]: PMMLDataField } = {};

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

      shape[key] = dataFieldObj;
    }

    let modelSchema = new ModelSchema<PMMLDataField>(shape);

    return new PMMLModel(modelSchema, obj.data);
  }
}