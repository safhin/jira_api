const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const fs = require('fs')
const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(cors());

app.use(express.static(__dirname + '/public'));
require('events').EventEmitter.defaultMaxListeners = 0
app.set('view engine', 'ejs');


const msisdn = require('express-msisdn');
app.use(express.static("public"));
app.use(msisdn(['HTTP_X_UP_CALLING_LINE_ID', 'HTTP_MSISDN', 'HTTP_X_FH_MSISDN', 'HTTP_X_HTS_CLID', 'HTTP_X_UP_CALLING_LINE_ID', 'HTTP-ALL-RAW', 'HTTP-HOST', 'x-msisdn', 'HTTP-x-msisdn', 'x-h3g-msisdn', 'HTTP-x-h3g-msisdn', 'HTTP-X-MSISDN-Alias', 'X-MSISDN-Alias', 'HTTP-x-h3g-msisdn', 'HTTP-msisdn', 'msisdn', 'MSISDN', 'X-WAP-PROFILE', 'X-UP-CALLING-LINE-ID ', 'X-H3G-MSISDN', 'X-FH-MSISDN ', 'X-MSP-MSISDN', 'X-INTERNET-MSISDN', 'X_MSISDN', 'HTTP_X_MSISDN']));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', (req, res) => {
   res.send("working");
});

const getInclude = require('./api/app/v1/include')
app.use('/api/app/v1/include', getInclude)

const cache_clear = require("./api/cache-clear/cache-clear");
app.use("/api/cache-clear", cache_clear);

const subcriptionSync = require('./api/common/v1/subSync')
app.use('/api/v1/subSync', subcriptionSync)


const OTPSend = require('./api/common/v1/OTPSend')
app.use('/api/v1/otpSend', OTPSend)

// var checkAuthorize = function (req, res, next) {
//     if (typeof req.headers.authorization !== "undefined") {
//         let token = req.headers.authorization.split(" ")[1];
//         if (token != '2Comics4mh5ln64ron5t26kpvm3toBlog') {
//             return res.status(401).json({
//                "success": false,
//                "message": "Not Authorized",
//                "data": ''
//             });
//         }
//     } else {
//         return res.status(401).json({
//             "success": false,
//             "message": "Not Authorized",
//             "data": ''
//         });
//     }
//   next()
// }


const getMsisdn = require('./api/app/v1/getMsisdn')
app.use('/api/app/v1/getMsisdn', getMsisdn)


// app.use(checkAuthorize)

const getContent = require('./api/v1/content')

app.use('/api/v1/content', getContent)

const userOtp = require('./api/common/v1/otp')

app.use('/api/v1/user', userOtp)

const getHome = require('./api/app/v1/content')

app.use('/api/app/v1/content', getHome)




app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});


app.use((err, req, res, next) => {
   res.status(err.status || 508).json({
      error: {
         code: err.status || 508,
         message: err.message
      }
   });
});

module.exports = app;