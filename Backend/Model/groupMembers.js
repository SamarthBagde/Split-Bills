import { DataTypes } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

const groupMembers = sequelize.define(
  "groupMembers",
  {
    groupMembersId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
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
