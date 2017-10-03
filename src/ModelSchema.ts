import DataField from './DataField';
import InputData from './InputData';


export default class ModelSchema<DataFieldType> {
  shape: { [key: string]: DataField };

  validateInputData(inputData: InputData) {
    let errors: string[] = [];
    
    // make sure input has all the same properties...
    for (let key in this.shape) {
      if (!Object.prototype.hasOwnProperty.call(this.shape, key)) {
        continue;
      }

      const schemaField = this.shape[key];

      if (!Object.prototype.hasOwnProperty.call(inputData.input, key)) {
        errors.push(`Input data does not contain field "${key}".`);
      }

      const inputValue = inputData.input[key];

      try {
        schemaField.validateForValue(inputValue)
      } catch (err) {
        errors.push(`Validation for field '${key}' failed. ${err.message}`);
      }
    }

    if (errors.length != 0) {
      throw new Error(errors.join('\n'));
    }
  }
}