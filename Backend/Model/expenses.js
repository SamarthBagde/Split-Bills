import { DataTypes, DATE } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const expenses = sequelize.define(
  "expenses",
  {
    expense_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 20],
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
    paid_by: {
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
    group_id: {
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
