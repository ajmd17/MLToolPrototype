import { Lambda } from 'aws-sdk';
import * as httpStatus from 'http-status-codes';
import * as assert from 'assert';

import Convertable from '../Convertable';
import S3StoredModel from '../S3StoredModel';
import PMMLModel from '../pmml/PMMLModel';
import PMMLDataField from '../pmml/PMMLDataField';
import ModelSchema from '../ModelSchema';

const lambda = new Lambda();

export default class SKLearnModel extends Convertable<Uint8Array> implements S3StoredModel {
  constructor(public key: string) {
    super();
  }

  getModel(): Promise<PMMLModel> {
    const convertToPmml = (): Promise<string> => new Promise((resolve, reject) => {
      lambda.invoke({
        FunctionName: 'SKLearn2PMML',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({ key: this.key })
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          // should return data containing s3 key of pmml model
          if (data.StatusCode >= 200 && data.StatusCode < 400) {
            const payload = JSON.parse(data.Payload);
            const pmmlFileKey: string = payload.key;
            resolve(pmmlFileKey); 
          } else {
            reject(Error(httpStatus.getStatusText(data.StatusCode)));
          }
        }
      });
    });

    const extractPmmlSchema = (pmmlKey: string): Promise<ModelSchema<PMMLDataField>> => new Promise((resolve, reject) => {
      lambda.invoke({
        FunctionName: 'Testing',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({ key: pmmlKey })
      }, (err, data) => {
        console.log('extractPmmlSchema data = ', data);
        if (err) {
          reject(err);
        } else {
          // should return data containing s3 key of pmml model
          if (data.StatusCode >= 200 && data.StatusCode < 400) {
            const payload = JSON.parse(data.Payload);

            if (payload.errorMessage) {
              reject(payload.errorMessage);
              return;
            }

            const { shape } = payload;

            try { assert(shape != null, 'shape not found'); }
            catch (err) { reject(err); return; }

            let newShape: { [key: string]: PMMLDataField } = {};
            for (let key in shape) {
              newShape[key] = new PMMLDataField(shape[key]);
            }

            const schema = new ModelSchema<PMMLDataField>(newShape);

            try {
              schema.validateSelf();
            } catch (err) {
              reject(Error(`Failed to validate schema: "${err.message}"`));
            }

            resolve(schema);
          } else {
            reject(Error(httpStatus.getStatusText(data.StatusCode)));
          }
        }
      });
    });

    return convertToPmml().then((key: string) => PMMLModel.byKey(key));
  }
}