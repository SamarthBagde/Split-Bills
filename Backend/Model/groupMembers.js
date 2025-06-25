import { DataTypes } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const groupMembers = sequelize.define(
  "groupMembers",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  { timestamps: false }
);

export default groupMembers;
