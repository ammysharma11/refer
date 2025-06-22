Multi-Level Referral System – README & Architecture Documentation
=================================================================

Overview:
---------
This project implements a multi-level referral system with real-time profit distribution.

Features:
- Max 8 direct referrals per user
- 5% profit for direct referrer (Level 1)
- 1% profit for indirect referrer (Level 2)
- Real-time earnings updates via WebSocket (Socket.IO)
- Profit only distributed when purchase >= ₹1000
- Simple HTML frontend for testing and simulation

---

📦 Dependencies (from package.json)
------------------------------------
Make sure the following packages are installed:

- express
- mongoose
- dotenv
- cors
- socket.io
- nodemon (dev)
- concurrently (optional for frontend/backend split)

Install all dependencies using:

    npm install

---

🚀 Project Setup
-----------------
1. Clone the repository:

    git clone https://github.com/your-username/your-repo.git
    cd your-repo

2. Create a `.env` file:

    MONGO_URI=your_mongo_connection_string
    PORT=5050

3. Start the server:

    npm run dev

Open the browser at: [http://localhost:5050](http://localhost:5050)

---

🧱 System Architecture
-----------------------
1. **User Limit**: Each user can refer up to 8 people.
2. **Referral Tree**: Two-level structure (Direct → Indirect).
3. **Earnings**:
    - Direct Referrer: Earns 5%
    - Indirect Referrer: Earns 1%
4. **Purchase Validation**: Only purchases ≥ ₹1000 qualify.
5. **Real-time Updates**: Socket.IO pushes earnings to parent users instantly.

Example:
--------
User A refers B → B refers C

If C purchases for ₹2000:
- B (Level 1) earns ₹100
- A (Level 2) earns ₹20

---

📊 Data Models (MongoDB/Mongoose)
----------------------------------

User Model:
- name, email
- referredBy (userId)
- referrals: [userId]

Earning Model:
- userId: who earned
- fromUserId: who purchased
- level: 1 or 2
- earningAmount, purchaseAmount

---

📡 API Usage
------------

1. **Create User**
POST `/api/users`

```json
{
  "name": "John",
  "email": "john@example.com",
  "referredBy": "parentUserId"  // optional
}
```

2. **Simulate Purchase**
POST `/api/purchases`

```json
{
  "userId": "buyerId",
  "amount": 1500
}
```

3. **Get Earnings Report**
GET `/api/earnings/report/:id`

Returns earnings by level and by individual referrer.

---

🔧 Local Testing via HTML UI
-----------------------------
Open `/public/index.html` in browser after starting the backend server.

You can:
- Create users
- Simulate purchases
- Listen for live earnings updates
- View analytics report by user

---

🙋 Author
----------

GitHub: [github.com/ammysharma11](https://github.com/ammysharma11)

---

✅ Ready for Deployment or Extension
-------------------------------------
You can convert this backend into a production API or plug it into a frontend framework like React/Next.js.
