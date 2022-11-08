const express = require('express');
const app = require("./app");
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 9000;

// listen for requests
app.listen(port, () => {
    console.log(`ready on http://localhost:${port}`)
});