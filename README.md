# Evenctycap
Is a social (fecebook like) event app, where users can create any type of events, other users<br>
can sign in to those events as guests, and rate the event after its done.

## Technologies
* ReactJS
* NodeJS
* ExpressJS
* TypeScipt

## Getting Started
1. clone the project
2. run npm i
3. create an .env file within the root folder with the necesary values

## Required values for the .env file

* NODE_ENV: node execution environtent.
	* example: test, development, production.
* PORT: port on wich the API will be served.
	* example: 3000.
* JWT_SECRET: the secret to sign the user tokens.
	* example: mysupersecuresecret123
* MONGODB_URL: mongodb base url (no database name included).
	* example: "mongodb://localhost:12314".
* DBNAME: name of the database to use.
	* example: mydb
* TEST_DBNAME: name of the databa to use when runing tests.
	* example: mydb_test
* ACCESS_TOKEN_EXPIRY: time for the jwt access token to expire (minutes).
	* example: 5 (minutes)
* REFRESH_TOKEN_EXPIRY: time for the jwt refresh token to expire (days).
	* example: 30 (days)
* SENDGRID_API_KEY: api key for the app mailing system.
	* example: SG.mysengridsupersecretapikey

## COMMANDS

### Setup

```text
npm install
```

### Typescript to Javascript compilation

```text
npm build
```

### Development

```text
npm run dev
```

### Production

```text
npm start
```
