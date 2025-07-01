# Split-Bills (Backend API)

💸 A backend-only REST API built with **Node.js**, **Express**, and **MySQL** to manage and track group expenses. It allows users to register, create groups, add shared expenses, and compute who owes whom in group transactions.

---

## 🛠️ Features (Backend Only)

### 🔐 User Authentication
- User **registration** and **login**
- Passwords hashed securely using `bcrypt`
- JWT-based session management

### 👥 Group Management
- Create and manage **groups**
- Add **members** to a group
- **Edit or delete** group (only by group owner)

### 💰 Expense Management
- Any group member can **add an expense**
- Expense is automatically **split equally** among group members
- Expense creators can **update expense details**

### ⚖️ Settlement Logic
- **Settle Up** feature:
  - Computes net balances for all group members
  - minimize number of payments required

---

 ## 🔧 Tech Stack

- **Backend**: Node.js + Express.js  
- **Database**: MySQL (via Sequelize ORM)  
- **Authentication**: JWT  
- **Security**: bcrypt for password hashing



