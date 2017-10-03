import Model from './Model';

abstract class Convertable<DataType> {
  constructor(public data: DataType) {}

  getData(): DataType {
    return this.data;
  }

  abstract getModel(): Model<any, any> | Promise<Model<any, any>>;
}

export default Convertable;