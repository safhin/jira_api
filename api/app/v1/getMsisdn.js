const axios = require('axios');
var express = require('express')
var cors = require('cors')
const fetch = require('node-fetch');
var dateTime = require('node-datetime');
var dateFormat = require('dateformat');
var crypto = require("crypto");
var fs = require('fs');
var url = require('url');




var app = express()
const msisdn = require('express-msisdn');
app.set('view engine', 'ejs')
app.use(express.static("public"));
app.use(msisdn(['HTTP_X_UP_CALLING_LINE_ID', 'HTTP_MSISDN', 'HTTP_X_FH_MSISDN', 'HTTP_X_HTS_CLID', 'HTTP_X_UP_CALLING_LINE_ID', 'HTTP-ALL-RAW', 'HTTP-HOST', 'x-msisdn', 'HTTP-x-msisdn', 'x-h3g-msisdn', 'HTTP-x-h3g-msisdn', 'HTTP-X-MSISDN-Alias', 'X-MSISDN-Alias', 'HTTP-x-h3g-msisdn', 'HTTP-msisdn', 'msisdn', 'MSISDN', 'X-WAP-PROFILE', 'X-UP-CALLING-LINE-ID ', 'X-H3G-MSISDN', 'X-FH-MSISDN ', 'X-MSP-MSISDN', 'X-INTERNET-MSISDN', 'X_MSISDN', 'HTTP_X_MSISDN']));

//LogInit
const LogLater = require('../../../utility/loggar');
const System = require('../../../utility/system');



/**
 * 
 *  Get MSISDN Page
 *
 */
app.get('/', function(req, res) {


        /*Log Init*/
        var asiaTime = new Date().toLocaleString('en-BN', { timeZone: 'Asia/Dhaka' });
        var log_date = dateFormat(asiaTime, "yyyy-mm-dd");

        var logfile_msisdn = new LogLater('logs/msisdn-log-' + log_date+ '.log');

        var formatted_msisdn = typeof(req.msisdn) != "undefined" ? '880' + req.msisdn.substr(-10): 'NO_MSISDN';
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        
        console.log(fullUrl);


        
        //formatted_msisdn='8801914065999';
        if(formatted_msisdn != 'NO_MSISDN'){

                var operator= System.getOperatorName(formatted_msisdn);
                console.log(formatted_msisdn+' OP>>'+operator);
                var response = {user_info: { "oparetor": operator, "msisdn": formatted_msisdn }}
                res.status(200).json(response);

        }else{
                var response = {user_info: { "oparetor": "", "msisdn": formatted_msisdn }};
                res.status(200).json(response);
                
        }

        logfile_msisdn.dateline(formatted_msisdn + " | "+ fullUrl + " | "+req.get('user-agent')+ " | "+ JSON.stringify(response));
        return;

});




module.exports = app