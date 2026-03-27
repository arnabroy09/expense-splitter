# Expense Splitter

A fully free static **Trip Expense Tracker and Expense Splitter** web app built with **HTML, CSS, and Vanilla JavaScript**.

It helps friends or groups:

- track trip/event expenses
- calculate total group expense
- transfer person-wise expenses into a split calculator
- find out who should receive money
- find out who should pay money
- generate a clean settlement summary

This project is designed to work as a **simple, practical, mobile-friendly utility tool** and can be hosted directly on **GitHub Pages**.

---

## Features

### Trip Expense Tracker
- Trip title input
- Total number of people
- Dynamic person cards
- Fields for:
  - Name
  - Amount Carried
  - Amount Remaining
- Auto-calculated expense:
  - `Expense = Amount Carried - Amount Remaining`
- Live total group expense display
- One-click transfer to Split Calculator

### Split Calculator
- Auto-filled people and paid amounts from tracker
- Equal split mode
- Custom split mode
- Per-person balance calculation
- Settlement summary:
  - who pays whom
  - how much
- Copy full result
- Copy settlement summary
- Download summary

### UI / UX
- Clean card-based interface
- Mobile responsive
- Dark / Light theme toggle
- Toast notifications
- Animated total amount
- Highlighted settlement section
- Print-friendly layout

### History
- localStorage-based recent history
- Load previous result
- Delete history item
- Clear all history

---

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript

---

## Project Type

This is a **fully static website**.

That means:

- No backend
- No database
- No login
- No signup
- No paid service
- No server-side code
- No API required

Perfect for:

- GitHub Pages
- local offline use
- easy sharing with friends

---

## How It Works

### Step 1: Track Expenses
In the **Trip Expense Tracker** tab, users enter:

- trip title
- number of people
- amount carried by each person
- amount remaining after the trip/event

The app automatically calculates each person's expense and shows the **Total Group Expense**.

### Step 2: Transfer to Split Calculator
With one click, the total expense and person-wise expenses are transferred to the **Split Calculator** tab.

### Step 3: Split the Expense
In the calculator tab, users can:

- split equally
- split using custom share values

The app then calculates:

- per-person share
- balances
- settlement summary

---

## Folder Structure

```bash
expense-splitter/
  index.html
  style.css
  script.js
  README.md
