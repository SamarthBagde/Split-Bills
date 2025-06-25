import users from "./users.js";
import groups from "./groups.js";
import expenses from "./expenses.js";
import groupMembers from "./groupMembers.js";
import expenseSplit from "./expenseSplit.js";

users.belongsToMany(groups, { through: groupMembers, foreignKey: "user_id" });
groups.belongsToMany(users, { through: groupMembers, foreignKey: "group_id" });

expenses.belongsTo(groups, { foreignKey: "group_id" });
expenses.belongsTo(users, { foreignKey: "paid_by", as: "payer" });

expenseSplit.belongsTo(expenses, { foreignKey: "expense_id" });
expenseSplit.belongsTo(users, { foreignKey: "user_id", as: "debtor" });
expenseSplit.belongsTo(users, { foreignKey: "paid_to", as: "creditor" });

export { users, groups, groupMembers, expenses, expenseSplit };
