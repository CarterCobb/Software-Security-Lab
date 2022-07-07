# Software Security Lab

This repo is bound to get bigger and more mature as time goes on.

## Current Requirements

- You must use a relational database to store login credentials.
- You must create an application that connects to the relational database.
- You must allow any anonymous user to register for an account by providing a username and password.
- You must use a salted SHA-256 hash to avoid storing the user's password in plan text in the database.
- You must allow registered users to attempt to login and compare the credentials they provide on login with the credentials stored in the database.  If they match the user is authenticated, if they do not match then refuse access to the application.

## Running the Project

First run `npm i` in the root dir to install dependancies. (you may need to run `npm i -g nodemon` if you dont have nodemon installed globally).

- Simply run `nodemon` in the root dir to star the app.

## App States

The project has different states for `production` & `development`. Below is a list of the current mutables.

- `production`
  - The app will cluster the server on multiple CPU threads for resiliance layers.
- `development`
  - The app will run one instace of the server.

To change state specify one of the above values in the `NODE_ENV` attribute within a `.env` file on the root dir.

## Additional Details

This was built as an assignment for a college class at [Neumont College of Computer Science](https://www.neumont.edu/). Please do not use any part of this project in any way that would be considered plagiarism.
