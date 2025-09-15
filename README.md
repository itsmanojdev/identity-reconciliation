# 🕒 Identity Resolution Service  

This project implements the **/identify** API for **Identity resolution problem**.  
The service consolidates multiple email/phone records of the same customer into a single identity.  

---

## Hosted URL for Live Demo

🔗 **Live Demo:** [Identity Reconciliation](https://identity-reconciliation-61rd.onrender.com/)  

### https://identity-reconciliation-61rd.onrender.com/

> See API Specification below for API Endpoint details 

## 🚀 Problem Statement  

Customers sometimes use different **emails** and **phone numbers** across orders.  
We need to unify these into a single customer identity while:  
- Keeping the **oldest contact as primary**  
- Linking all other records as **secondary**  
- Ensuring a consolidated view of all emails and phone numbers  

---

## 📖 Database Schema  

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20),
  email VARCHAR(255),
  linked_id INT REFERENCES contacts(id),
  link_precedence VARCHAR(20) CHECK (link_precedence IN ('primary', 'secondary')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

---

## 🔗 API Specification

### API Endpoint

```bash
POST /identify
```

### Request Body

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```
> At least one of email or phoneNumber will always be present.

### Response Format
```
{
  "contact": {
    "primaryContatctId": number,
    "emails": string[],        // all unique emails, primary first
    "phoneNumbers": string[],  // all unique phone numbers, primary first
    "secondaryContactIds": number[]  // all IDs linked to the primary
  }
}
```

---

## ⚙️ Core Rules  

### 🟢 New Primary  
If neither `email` nor `phoneNumber` exists in DB → create a new contact with `linkPrecedence="primary"`.  

### 🟡 New Secondary  
If `email`/`phoneNumber` matches an existing contact but new info is present → create a new contact with `linkPrecedence="secondary"`.  

### 🔄 Merge Primaries  
If a request links two different primaries → the **older one remains primary**, newer one becomes secondary, and all its secondaries get re-linked.  

### 📊 Accumulated View  
Always return a consolidated response with **all emails, phone numbers, and secondary IDs** in the group.  

---

## 🛠️ Tech Stack  

- **Backend**: Node.js, TypeScript
- **Database**: PostgreSQL  
- **Migrations**: [node-pg-migrate](https://salsita.github.io/node-pg-migrate/)  

---

## ▶️ Running Locally  

```bash
# 1. Clone repo
git clone https://github.com/itsmanojdev/identity-reconciliation.git
cd identity-reconciliation

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# update DATABASE_URL with your PostgreSQL connection string

# 4. Run migrations (only once)
npm run migrate up

# 5. (Optional) Seed the database
npm run seed

# 6. Start server
npm run dev
```

API will be available at: `http://localhost:3000/identify`

---

<p align="center">
  🚀 Built with passion & ❤️ for clean code by <b>itsmanojdev</b>
</p>

