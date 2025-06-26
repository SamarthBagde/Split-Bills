import { DataTypes } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const expenseSplit = sequelize.define(
  "expenseSplits",
  {
    expenseSplitId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    expenseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    }, // who owes
    paidTo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    }, // who owed
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 0.01,
      },
    },
  },
  {
    timestamps: false,
  }
);

export default expenseSplit;
