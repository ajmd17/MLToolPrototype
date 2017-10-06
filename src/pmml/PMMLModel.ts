import { Lambda } from 'aws-sdk';
import * as httpStatus from 'http-status-codes';
import * as assert from 'assert';

import Model from '../Model';
import InputData from '../InputData';
import S3StoredModel from '../S3StoredModel';
import ModelSchema from '../ModelSchema';
import PMMLDataField from './PMMLDataField';
import DataField from '../DataField';
import { JSONObject } from '../Typedefs';

const lambda = new Lambda();

export default class PMMLModel extends Model<PMMLDataField> {
  public static SCHEMA_EXTRACTOR_LAMBDA = 'Testing';
  public static EVALUATOR_LAMBDA = '';

  constructor(schema, key) {
    super(schema, key);

    if (!(schema instanceof ModelSchema)) {
      this.schema = new ModelSchema<PMMLDataField>(schema.shape);
    }

    // parse schema
    for (let key in this.schema.shape) {
      if (Object.prototype.hasOwnProperty.call(this.schema.shape, key)) {
        if (!(this.schema.shape[key] instanceof DataField)) {
          this.schema.shape[key] = new PMMLDataField(this.schema.shape[key]);
        }
      }
    }
  }

  static byKey(key: string): Promise<PMMLModel> {
    return new Promise((resolve, reject) => {
      lambda.invoke({
        FunctionName: PMMLModel.SCHEMA_EXTRACTOR_LAMBDA,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({ key })
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          // should return data containing s3 key of pmml model
          if (data.StatusCode >= 200 && data.StatusCode < 400) {
            const payload = JSON.parse(data.Payload);
            const { shape } = payload;

            try { assert(shape != null, 'shape not found'); }
            catch (err) { reject(err); return; }

            const pmml = new PMMLModel(new ModelSchema<PMMLDataField>(shape), key);

            try {
              pmml.schema.validateSelf();
            } catch (err) {
              reject(Error(`Failed to validate schema: "${err.message}"`));
            }

            resolve(pmml);
          } else {
            reject(Error(httpStatus.getStatusText(data.StatusCode)));
          }
        }
      });
    });
  }

  evaluate(csvData: string): Promise<JSONObject> {
    return new Promise((resolve, reject) => {
      lambda.invoke({
        FunctionName: 'PMMLEvaluator',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({ key: this.key, csvData: csvData })
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          // should return data containing s3 key of pmml model
          if (data.StatusCode >= 200 && data.StatusCode < 400) {
            const payload = JSON.parse(data.Payload);
            const csvData: string = payload.csvData;
            if (payload.errorMessage) {
              reject(payload.errorMessage);
              return;
            }
            resolve({ csvData });
          } else {
            reject(Error(httpStatus.getStatusText(data.StatusCode)));
          }
        }
      });
    });
  }

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