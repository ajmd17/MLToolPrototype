import { Value } from './Typedefs';
import DataField from './DataField';
import ModelSchema from './ModelSchema';

export default class InputData {
  constructor(public input: { [key: string]: Value }) {
  }

  validateAgainstSchema<T extends DataField>(schema: ModelSchema<T>) {
    schema.validateInputData(this);
  }
}