# CCPC Library : Inventory & Circulation System

A full-stack library management system for Chattogram Cantonment Public College,
built with **Node.js, Express, EJS, and SQLite** (MVC architecture).

---

## Roles & What Each Can Do

### Admin (librarian)
- Log in at `/auth/admin/login`
- Full catalog management: add / edit / delete books
- Student roster management: add / edit / delete students
- Issue books directly to students, mark returns
- **Approve or reject** student book requests
- View all active loans, overdue status, full history
- Dashboard with live stats

### Student
- Sign up at `/auth/student/signup` (or the admin adds them to the roster first — signing up then claims that record)
- Log in at `/auth/student/login` with roll number or email + password
- Browse the full book catalog, search by title/author/category
- **Request a book** — goes to admin for approval (one click to approve/reject)
- View their own active loans, request history, fines owed

---

## Getting Started

```bash
npm install
npm start
```

Open **http://localhost:3000** in your browser.

On first run, a default admin account is created automatically:

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

**Change this before deploying.** Set environment variables before first run to choose your own:

```bash
ADMIN_USERNAME=librarian ADMIN_PASSWORD=StrongPassword123 npm start
```

For auto-restart during development:

```bash
npm run dev
```

---

## Project Structure

```
app.js                        Entry point — wires everything
config/
  database.js                 SQLite connection + schema
  seedAdmin.js                Creates default admin on first run
middleware/
  auth.js                     requireAdmin / requireStudent guards
models/
  Admin.js                    Admin DB queries
  Book.js                     Book DB queries
  Student.js                  Student DB queries (includes auth)
  BorrowRecord.js             Issue / return / fine logic
  BorrowRequest.js            Student self-service requests
controllers/
  authController.js           Login / signup / logout handlers
  portalController.js         Student portal handlers
  bookController.js           Admin book CRUD
  studentController.js        Admin student CRUD
  borrowController.js         Admin borrow / return / requests
routes/
  auth.js                     /auth/*
  portal.js                   /portal/* (student, requires login)
  books.js                    /books/* (admin only)
  students.js                 /students/* (admin only)
  borrow.js                   /borrow/* (admin only)
views/
  landing.ejs                 Public homepage with role selector
  dashboard.ejs               Admin dashboard
  auth/                       Login & signup pages
  portal/                     Student portal pages
  books/ students/ borrow/    Admin management pages
  partials/                   layout.ejs + portal-layout.ejs
public/css/style.css          All styling
db/library.db                 SQLite database (auto-created)
```

---

## Workflow: Student Requests a Book

1. Student signs up and logs in
2. Browses catalog → clicks **Request** on an available book
3. Admin sees a badge on the **Requests** nav link
4. Admin opens **Borrow Requests**, clicks **Approve**
5. Loan is created, book's available count decrements
6. Student sees the loan on their dashboard and in **My Loans**

---

## Notes

- Loan period defaults to 14 days; configurable per direct issue
- Late fines: ৳#/day, calculated automatically at return
- Duplicate loan prevention: a student can't borrow or request the same book twice while an active loan is open
- Session lasts 24 hours
- The SQLite database file lives at `db/library.db` — delete it to reset everything

## Possible Next Steps

- Password reset flow
- Admin can manage other admin accounts
- CSV export of catalog / history
- Due-date email/SMS reminders
- Book cover image support
