import * as AWS from 'aws-sdk';

import Convertable from '../Convertable';
import PMMLModel from '../pmml/PMMLModel';

const lambda = new AWS.Lambda();

export default class SKLearnModel extends Convertable<Uint8Array> {
  getModel(): Promise<PMMLModel> {
    return new Promise((resolve, reject) => {
      // load schema...
      lambda.invoke({
        FunctionName: 'Testing',
        InvocationType: 'RequestResponse'
      }, (err, data) => {
        console.log({data});
      });

    });
  }
}