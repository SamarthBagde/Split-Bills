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
    expense_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    }, // who owes
    paid_to: {
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
