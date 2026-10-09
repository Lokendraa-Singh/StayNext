# WanderLust

An Airbnb-style website: browse listings, add your own place, write reviews.
Built with Node.js, Express, MongoDB (Mongoose), EJS, Bootstrap and Passport.

## Folder structure

```
WanderLust/
├── frontend/              <- everything the user SEES
│   ├── views/             pages (EJS): listings, users, includes, layouts, error
│   └── public/            css/style.css and js/script.js
│
├── backend/               <- everything that WORKS behind the scenes
│   ├── app.js             main server file
│   ├── routes/            listing.js, reviews.js, user.js
│   ├── models/            listing.js, review.js, user.js (database)
│   ├── middleware.js      login / owner checks
│   ├── schema.js          Joi validation
│   ├── utils/             wrapAsync.js, expressError.js
│   └── init/              sample data + seed script
│
├── package.json           packages and start scripts
├── .env.example           copy to .env
└── README.md
```

## Run on your own computer

1. Install packages: `npm install`
2. Copy `.env.example` to `.env` (leave `ATLAS_DB_URL` empty to use local MongoDB)
3. (Optional) add sample data: `npm run seed`
   (creates a demo account: username `demo`, password `demo1234`)
4. Start: `npm start` and open http://localhost:8080

## Deploy (MongoDB Atlas + Render)

### 1. Database (MongoDB Atlas)
1. Create a free cluster on https://www.mongodb.com/atlas
2. Database Access -> add a user with a password
3. Network Access -> allow `0.0.0.0/0`
4. Connect -> Drivers -> copy the connection string and add the database name,
   for example `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/wanderLust`
5. Put this string in `.env` as `ATLAS_DB_URL`, then run `npm run seed` once
   on your computer to fill the online database with sample listings.

### 2. Code on GitHub
Push the whole WanderLust folder (frontend + backend together) to a GitHub repository.
`.gitignore` already keeps `node_modules` and `.env` out.

### 3. Render
1. Render.com -> New -> Web Service -> connect your GitHub repo
2. Build command: `npm install`
3. Start command: `npm start`
4. Environment variables:
   - `ATLAS_DB_URL` = your Atlas string
   - `SESSION_SECRET` = any long random text
   - `NODE_ENV` = `production`
5. Deploy. Your site will be live on a `.onrender.com` link.
