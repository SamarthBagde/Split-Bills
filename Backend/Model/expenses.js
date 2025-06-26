import { DataTypes, DATE } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const expenses = sequelize.define(
  "expenses",
  {
    expenseId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [3, 20],
          msg: "Expense title must be between 3 and 20 characters",
        },
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 0.01,
      },
    },
    paidBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },

    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
  },
  { timestamps: false }
);

export default expenses;
