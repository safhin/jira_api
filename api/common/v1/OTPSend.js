const express = require("express");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const request = require('request');
const db = require("../../../db/database");
const sub = require("../../../domain/common/sub");
var dateFormat = require('dateformat');
const router = express.Router();
const redis = require('redis');
var axios = require('axios');
const { validateMsisdn,getNumberOfDays,uuid } = require("../../../utils/validate")
const config = require("../../../config/base_url");
const apiUrl = config.apiurl;
//LogInit
const LogLater = require('../../../utility/loggar');
const System = require('../../../utility/system');

//FOR APP

router.post("/", async (req, res) => {

    try{

        /*Log Init*/
        var asiaTime = new Date().toLocaleString('en-BN', { timeZone: 'Asia/Dhaka' });
        var log_date = dateFormat(asiaTime, "yyyy-mm-dd");
        var logfile_access = new LogLater('logs/access-log-' + log_date+ '.log');
        var logfile_error = new LogLater('logs/error-log-' + log_date + '.log');
        var logfile_otpsend = new LogLater('logs/otpSend-log-' + log_date+ '.log');
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        logfile_access.dateline(req.hostname + " | "+fullUrl + " | "+req.get('user-agent')+"Reqbody"+JSON.stringify(req.body));


        let formated_msisdn = typeof(req.body.msisdn) != "undefined"  ? '880' + req.body.msisdn.substr(-10): 'NO_MSISDN';
            if(formated_msisdn == "NO_MSISDN")
                throw new Error('MSISDN rquired')

        const isValid = validateMsisdn(formated_msisdn);
        if (!isValid){
            return res.status(501).json({
                status: 501,
                message: 'Invalid mobile no entered!',
            }); 
        }

        let secrect_code = typeof(req.body.secrect_code) != "undefined"  ? req.body.secrect_code: '';
            if(secrect_code.length==0)
                throw new Error('Secrect code rquired')

        let operator = typeof(req.body.operator) != "undefined"  ? req.body.operator: System.getOperatorName(formated_msisdn);
            if(operator.length==0)
                throw new Error('operator rquired')


       
        

        /*Logwrite*/ 

        let sms = `MCOMCIS+OTP+code+is+${secrect_code}+.`;
        var smsSendUrl='';
        if(operator=='blink'){
             smsSendUrl = `http://103.4.145.85/service/ChargeGW/onDemand/comic_sms.php?Username=comicUsr&Password=comic@33K&Mobileno=${formated_msisdn}&smsText=${sms}`;
        }else if(operator=='robi'){
             smsSendUrl = `http://103.4.145.99/service/SDP/SMS_API/soap/send_sms.php?Username=follo&Password=follo28777&category=21252&to=${formated_msisdn}&text=${sms}&from=21252`;
        }else{
            return res.status(501).json({
                status: 501,
                message: "Invalid mobile operator"
            });
        }
        //let smsSendUrl = `http://103.4.145.99/service/SDP/SMS_API/soap/send_sms.php?Username=follo&Password=follo28777&category=21252&to=${formated_msisdn}&text=${sms}&from=21252`;
        const get_data = async smsSendUrl => {
            try {
                const response = await fetch(smsSendUrl);
                const result = await response.text();
                var callBackStatus = result;
                console.log('OTP Send',callBackStatus);
                logfile_otpsend.dateline(`MSISDN: ${formated_msisdn} | Shortocde:  21252 | SMS : ${sms} | Response: ${callBackStatus} | URL: ${smsSendUrl}`);

                //CallBackStatusUpdate
                return res.status(501).json({
                    status: 200,
                    message: 'OTP send successfully completed.'
                }); 
                
            
            } catch (err) {
                logfile_error.dateline(formated_msisdn + " | "+ fullUrl +" | "  + err.message +err.stack+ " | "+req.get('user-agent'));
                return res.status(501).json({
                    status: 501,
                    message: err.message
                }); 
            }
        };
        get_data(smsSendUrl);

    }catch (err) {
        logfile_error.dateline(req.hostname + " | "+ fullUrl +" | "  + err.message +err.stack+ " | "+req.get('user-agent'));
        return res.status(501).json({
            status: 501,
            message: err.message
        }); 
    }
});


module.exports = router;