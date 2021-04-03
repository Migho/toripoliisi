import { Model, DataTypes } from 'https://deno.land/x/denodb/mod.ts'

export default class Order extends Model {
  static table = 'orders'
  static timestamps = true
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chatId: {
      type: DataTypes.INTEGER,
    },
    url: {
      type: DataTypes.STRING,
    },
    newestToriItemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    newestToriItemTimestamp: {
      type: DataTypes.TIMESTAMP,
      allowNull: true,
    },
  }
}