import users from "./users.js";
import groups from "./groups.js";
import expenses from "./expenses.js";
import groupMembers from "./groupMembers.js";
import expenseSplit from "./expenseSplit.js";

users.belongsToMany(groups, { through: groupMembers, foreignKey: "userId" });
groups.belongsToMany(users, { through: groupMembers, foreignKey: "groupId" });

expenses.belongsTo(groups, { foreignKey: "groupId" });
expenses.belongsTo(users, { foreignKey: "paidBy", as: "payer" });

expenseSplit.belongsTo(expenses, { foreignKey: "expenseId" });
expenseSplit.belongsTo(users, { foreignKey: "userId", as: "debtor" });
expenseSplit.belongsTo(users, { foreignKey: "paidTo", as: "creditor" });

export { users, groups, groupMembers, expenses, expenseSplit };
