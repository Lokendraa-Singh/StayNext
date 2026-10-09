# StayNext

An Airbnb-style web app where you can browse stays, list your own property and write reviews.
The site shows the brand name WanderLust.

Live: `<add your Render link here>`
Demo login: `demo` / `demo1234`

## Features

* Sign up / Log in / Log out (Passport.js, hashed passwords)
* Add, edit and delete listings (only the owner can edit or delete)
* Reviews with 1-5 star rating (only the author can delete)
* Deleting a listing also deletes its reviews
* Form validation (Bootstrap + Joi) and flash messages
* Login sessions stored in MongoDB
* Responsive design

## Stack

Node.js, Express, MongoDB, Mongoose, Passport.js, Joi on the backend. EJS, Bootstrap, CSS and JavaScript on the frontend.

## Folder structure

```
frontend/   pages (EJS), css, js
backend/    app.js, routes, models, middleware, validation, sample data
```

## Running it locally

```
npm install
cp .env.example .env   # fill in your own values
npm run seed           # optional: sample listings + demo user
npm start
```

Then open http://localhost:8080

## Environment variables

```
ATLAS_DB_URL=your MongoDB connection string
SESSION_SECRET=any random string
NODE_ENV=development
```

## Deploying

Database on MongoDB Atlas. The whole app (frontend + backend) runs as one service on Render: build `npm install`, start `npm start`, and the 3 environment variables above (`NODE_ENV=production`).
Render's free tier sleeps, so the first load can take about 30-50 seconds.