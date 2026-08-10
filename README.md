# FOLD - **_Restaurant App_**

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Run Locally](#run-locally)
- [Testing](#testing)
- [Deployment](#deployment)
- [Collaborators](#collaborators)
- [Course](#course)

## About

FOLD is a full-stack food ordering web app built with React on the frontend and a serverless AWS backend (Lambda, API Gateway, DynamoDB, Cognito, and SES). Users can browse the menu, sign up and log in, build a cart, check out, and receive an automated order confirmation email.

## Features

- Interactive Menu Browsing: filter and view dishes by category
- User Authentication: sign-up/login via AWS Cognito
- Cart Management: add, update quantity, and remove items, with a live item-count badge
- Checkout & Ordering: places an order, computes subtotal/NYC sales tax (8.875%)/total server-side, and clears the cart
- Order Confirmation Emails: an automated, branded HTML email is sent via AWS SES the moment an order is placed
- CI/CD: GitHub Actions runs frontend and backend test suites on every push, and auto-deploys the backend on merges to `main`

## Tech Stack

**Frontend**
- React + Vite
- AWS Amplify (Cognito auth)
- CSS
- Vitest + React Testing Library (unit tests)

**Backend**
- AWS SAM (Infrastructure as Code)
- AWS Lambda (Node.js)
- Amazon API Gateway (HTTP API, Cognito JWT authorizer)
- Amazon DynamoDB (single-table design)
- Amazon Cognito (user auth)
- Amazon SES (order confirmation emails)
- Jest + aws-sdk-client-mock (unit tests)

## Project Structure

```
Team2/
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/    # Navbar, Menu, Cart, Checkout, Order, etc.
│       ├── hooks/          # useCart, etc.
│       └── utils/          # api.js (backend calls), cartId.js
├── backend/           # AWS SAM serverless backend
│   ├── template.yaml       # IaC: API Gateway, Lambdas, DynamoDB, IAM
│   ├── samconfig.toml      # Deploy configuration
│   └── lambdas/
│       ├── foldGetMenuItems/
│       ├── foldGetCart/
│       ├── foldUpdateCartItem/
│       ├── foldDeleteItem/
│       └── foldPlaceOrder/     # Places order + sends SES confirmation email
└── .github/workflows/  # CI/CD pipeline (test + deploy)
```

## Installation

**Frontend**

```bash
cd frontend
npm install
```

**Backend**

```bash
cd backend
npm install
```

## Run Locally

Start the frontend dev server:

```bash
cd frontend
npm run dev
```

The frontend calls a deployed backend API (see `frontend/src/utils/api.js` for the endpoint), so the backend must be deployed to AWS first — see [Deployment](#deployment).

## Testing

**Frontend** (Vitest + React Testing Library):

```bash
cd frontend
npm test
```

**Backend** (Jest):

```bash
cd backend
npm test
```

Both suites run automatically in CI on every push via GitHub Actions.

## Deployment

The backend is deployed with AWS SAM:

```bash
cd backend
sam build
sam deploy
```

`samconfig.toml` supplies the Cognito User Pool/App Client IDs and the SES-verified `SenderEmail` as parameter overrides. The frontend is hosted on AWS Amplify Hosting, which auto-builds from the connected GitHub repo.

Merges to `main` trigger the `deploy-backend` GitHub Actions job automatically, gated on the frontend and backend test suites passing first.

## Collaborators

- [Dassi Berry](https://github.com/hadassahberry) - Team Leader
- [Nechama Lerner](https://github.com/nechamablerner)
- [Shira Cheifetz](https://github.com/shiracheifetz)

## Course

Course: CIS 490: Senior Seminar in Computer Science

Semester: Summer 2026
