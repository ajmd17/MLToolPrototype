import Model from './Model';
import DataField from './DataField';
import CsvSplitter from './CsvSplitter';
import { JSONObject } from './Typedefs';

class WeightedModel <T extends DataField> extends Model<T> {
  constructor(public left: Model<T>, public right: Model<T>, public weight: number = 0.5) {
    super(left.schema);
  }

  evaluate(csvData: string): Promise<JSONObject> {
    const evaluateLeft = () => {
      if (this.left == null) {
        return null;
      }

      return this.left.evaluate(csvData);
    };

    const evaluateRight = () => {
      if (this.right == null) {
        return null;
      }

      return this.right.evaluate(csvData);
    };

    return Promise.all([evaluateLeft(), evaluateRight()]).then(([aResult, bResult]) => {
      // TODO this should be made better to not have to parse csv here
      // instead evaluate() methods should just return a number or something and handle the rest from schema on server.

      if (bResult == null) {
        return aResult;
      }

      let aSplit = CsvSplitter.split(aResult.csvData);
      let bSplit = CsvSplitter.split(bResult.csvData);

      

      return null; // @TODO
    });
  }

  serialize() {
    return {
      left: this.left != null ? this.left.serialize() : null,
      right: this.right != null ? this.right.serialize() : null,
      weight: this.weight
    };
  }
}

export default WeightedModel;