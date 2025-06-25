import { DataTypes } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const expenseSplit = sequelize.define(
  "expenseSplits",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    expense_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER, // who owes
    paid_to: DataTypes.INTEGER, // who owed
    amount: DataTypes.FLOAT,
  },
  {
    timestamps: false,
  }
);

export default expenseSplit;
