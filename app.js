"use strict";

const express = require("express");
const fs = require("fs/promises");
const globby = require("globby");
const multer = require("multer");
const bodyParser = require('body-parser');

const app = express();

const SERVER_ERR_CODE = 500;
const SERVER_ERROR = "Sorry the server couldn't process this properly, please try again later.";
const CLIENT_ERROR_CODE = 400;

const DEBUG = false;

app.use(express.urlencoded({
	extended: true
}));
app.use(express.json());
app.use(multer().none());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static("public"));


app.get("/getStoreDeals", async function (req, res, next) {
	console.log("hello");
	try {
		let txt = await fs.readFile("data/store_offers.json");
		res.type("json");
		res.send(JSON.parse(txt));
	} catch (err) {
		res.status(SERVER_ERR_CODE);
		err.message = SERVER_ERROR;
		next(err);
	}
});

app.get("/getBankOffers", async function (req, res, next) {
	try {
		let txt = await fs.readFile("data/bank_offers.json");
		res.type("json");
		res.send(JSON.parse(txt));
	} catch (err) {
		res.status(SERVER_ERR_CODE);
		err.message = SERVER_ERROR;
		next(err);
	}
});

app.get("/getDeals", async function (req, res, next) {
	try {
		let txt = await fs.readFile("data/deals.json");
		res.type("json");
		res.send(JSON.parse(txt));
	} catch (err) {
		res.status(SERVER_ERR_CODE);
		err.message = SERVER_ERROR;
		next(err);
	}
});


app.post("/postDriverBid", async function (req, res, next) {
	console.log(req);
	const bid = req.body;
	console.log(bid);

	try {
		await fs.writeFile(`data/deals.json`, JSON.stringify(bid));
		res.type("text");
		res.send("Feedback Received. Thank you for your feedback!");
	} catch (err) {
		res.status(SERVER_ERR_CODE);
		err.message = SERVER_ERROR;
		next(err);
	}
});

app.post("/postStoreBid", async function (req, res, next) {
	console.log(req);
	const bid = req.body;
	console.log(bid);

	try {
		await fs.writeFile(`data/store_offers.json`, JSON.stringify(bid));
		res.type("text");
		res.send("Feedback Received. Thank you for your feedback!");
	} catch (err) {
		res.status(SERVER_ERR_CODE);
		err.message = SERVER_ERROR;
		next(err);
	}
});

app.use(function (err, req, res, next) {
	if (DEBUG) {
		console.error(err);
		console.log(req.url);
	}
	res.status(SERVER_ERR_CODE);
	res.type("text");
	res.send(err.message);
});

/**
 * Starts server on specified port
 */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}...`);
});