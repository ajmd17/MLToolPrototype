import Model from './Model';

abstract class Convertable<DataType> {
  abstract getModel(): Model<any> | Promise<Model<any>>;
}

export default Convertable;