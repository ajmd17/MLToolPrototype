export type Value = string | number;
export type JSONObject = { [key: string]: any };
export enum OpType {
  CATEGORICAL = 'categorical',
  CONTINUOUS = 'continuous'
}

export type DataType = 'string' | 'number';