const express = require("express");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const request = require('request');
const LogLater = require('../../../utility/loggar');
const db = require("../../../db/database");
const sql = require("../../../domain/v1/content/otp");
var dateFormat = require('dateformat');
const router = express.Router();
var axios = require('axios');
const { validateMsisdn,generateOtp } = require("../../../utils/validate")
const config = require("../../../config/base_url");
const apiUrl = config.apiurl;

//FOR APP
router.post('/otp/send', function (req, res) {
    try {

        let msisdn = req.body.msisdn;
        let operator = req.body.operator;

        let formated_msisdn = "880" + msisdn.substr(-10);
        const isValid = validateMsisdn(formated_msisdn);
        if (!isValid || !req.body.operator){
           return res.status(400).json({
                success: false,
                message: 'Invalid mobile no entered or operator!',
                data: ''
           }); 
        } 

        let send_time= dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
        let expired_time= dateFormat(new Date().setMinutes(new Date().getMinutes() + 5), "yyyy-mm-dd HH:MM:ss");
        let secret_key= generateOtp();
        let verify_status= 0;
        let otp_type = "none";
        let created_at= dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
        let updated_at= dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

        db.query(sql.otpInsertSQL(formated_msisdn,send_time,expired_time,secret_key,operator,verify_status,created_at,updated_at), (err, result1) => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log(result1)
        });
        // let url = ``;
        // request(url, function(error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         console.log("OTP Sent Successfully v1")
        //     }
        //     console.log(error)
        // });


        var data = JSON.stringify({"msisdn":formated_msisdn,"secrect_code":secret_key,"operator":operator});

        var config = {
          method: 'post',
          url: 'http://103.4.145.86:6005/api/v1/otpSend',
          headers: { 
            'Content-Type': 'application/json'
          },
          data : data
        };

        axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });

        return res.status(200).json({ 
            success: true, 
            message: 'OTP Sent Successfully',
            data:{
                "msisdn": formated_msisdn,
                "secret_key": secret_key
            } 

        });


    } catch (e) {
        res.status(501).json({
            "success": false,
            "message": "Something went wrong!!",
            "data": e.toString()
        });
    }
})


router.post('/otp/verification', function (req, res) {
    try {

        let { msisdn,secret_key } = req.body;

        let formated_msisdn = "880" + msisdn.substr(-10);
        const isValid = validateMsisdn(formated_msisdn);
        if (!isValid){
           return res.status(400).json({
                success: false,
                message: 'Invalid mobile no entered!',
                data: ''
           }); 
        } 
        let now = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

        let otp_verify = `SELECT * FROM otp_verification WHERE msisdn=${formated_msisdn} and secret_key=${secret_key} and expired_time >='${now}' and verify_status >='0'`;
        db.query(otp_verify, (err, otpverifyresult) => {
            if (err) {
                return res.status(500).send(err);
            }
            
            //otp_verifyed
            if(otpverifyresult.length){

                let form_data = {
                    "verify_status": "1"
                }

                //update_status
                db.query(sql.otpUpdate(otpverifyresult[0].id), (err, result) => {});
                //end_update_status
                console.log("OTP Verified successfully v1")
                res.status(200).json({
                    "success": true,
                    "message": "OTP verified Successfully.",
                    "data": formated_msisdn
                });

            } else {
                console.log("OTP Invalid v1")
                res.status(200).json({
                    "success": false,
                    "message": "Invalid OTP Code.",
                    "data": formated_msisdn
                });
            }
            //end otp_verifyed
             
        });

    } catch (e) {
        res.status(501).json({
            "success": false,
            "message": "Something went wrong!!",
            "data": e.toString()
        });
    }
})

module.exports = router;