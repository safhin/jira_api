const express = require("express");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const request = require('request');
const LogLater = require('../../../utility/loggar');
const db = require("../../../db/database");
const sub = require("../../../domain/common/sub");
var dateFormat = require('dateformat');
const router = express.Router();
const redis = require('redis');
var axios = require('axios');
const client = redis.createClient(6379);
const { validateMsisdn,getNumberOfDays,uuid } = require("../../../utils/validate")
const config = require("../../../config/base_url");
const apiUrl = config.apiurl;

//FOR APP
router.post("/subscribe1", async (req, res, next) => {
    
    let { msisdn,pack } = req.body;

    let formated_msisdn = "880" + msisdn.substr(-10);
    const isValid = validateMsisdn(formated_msisdn);
    if (!isValid){
        return res.status(400).json({
            success: false,
            message: 'Invalid mobile no entered!',
            data: ''
        }); 
    }

    let getUserByMsisdn = `SELECT * FROM user_sub_status WHERE msisdn=${formated_msisdn}`;

    db.query(getUserByMsisdn, (err, userResult) => {
            if (err) {
                return res.status(500).send(err);
            }
            

            if(userResult.length){

                var day = getNumberOfDays(new Date(),userResult[0].last_charge_at);

                if(userResult[0].sub_status == 1 && day <= userResult[0].validity) {

                    var response = {
                       "sub_status": 1,
                       "msisdn": formated_msisdn
                    }

                    return res.status(200).json({
                        "success": true,
                        "message": "already_subscribed",
                        "data": response
                    });

                } else {

                    let category = pack == 1 ? '0300411973' : pack == 2 ? "0300411975" : pack == 3 ? "0300411977" : "none";
                    let sub_status = 1;
                    let last_charge_at = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                    //update_sub
                    db.query(sub.subUpdate(formated_msisdn,category,pack,sub_status,last_charge_at), (err, result) => {

                        if (err) {
                            return res.status(500).send(err);
                        }

                        let url = ``;
                        request(url, function(error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log("Subscribe successfully.")
                            }
                            console.log(error)
                        });

                        var response = {
                           "sub_status": 1,
                           "msisdn": formated_msisdn
                        }
                        return res.status(200).json({
                            "success": true,
                            "message": "Subscribe successfully.",
                            "data": response
                        });

                    });

                }

            } else {
                    let user_uuid = uuid();
                    let category = pack == 1 ? '0300411973' : pack == 2 ? "0300411975" : pack == 3 ? "0300411977" : "none";
                    let validity = pack == 1 ? 15 : pack == 2 ? 30 : pack == 3 ? 45 : 0;
                    let sub_status = 1;
                    let last_charge_at = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                    let created_at= dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                    let updated_at= dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                    //insert_sub
                    db.query(sub.subInsert(user_uuid,formated_msisdn,category,pack,validity,sub_status,last_charge_at,created_at,updated_at), (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }

                        let url = ``;
                        request(url, function(error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log("Subscribe successfully.")
                            }
                            console.log(error)
                        });

                        var response = {
                           "sub_status": 1,
                           "msisdn": formated_msisdn
                        }
                        return res.status(200).json({
                            "success": true,
                            "message": "Subscribe successfully",
                            "data": response
                        });

                    });

            }
             
        });


});

router.post("/unsubscribe", async (req, res, next) => {
    
    let { msisdn } = req.body;

    let formated_msisdn = "880" + msisdn.substr(-10);
    const isValid = validateMsisdn(formated_msisdn);
    if (!isValid){
        return res.status(400).json({
            success: false,
            message: 'Invalid mobile no entered!',
            data: ''
        }); 
    }

    let getUserByMsisdn = `SELECT * FROM user_sub_status WHERE msisdn=${formated_msisdn}`;

    db.query(getUserByMsisdn, (err, userResult) => {
            if (err) {
                return res.status(500).send(err);
            }
            

            if(userResult.length){

                    db.query(sub.unSubUpdate(formated_msisdn), (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }

                        let url = ``;
                        request(url, function(error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log("UnSubscribe successfully.")
                            }
                            console.log(error)
                        });

                        var response = {
                           "sub_status": 0,
                           "msisdn": formated_msisdn
                        }
                        return res.status(200).json({
                            "success": true,
                            "message": "UnSub successfully.",
                            "data": response
                        });

                    });

            } else {

                    return res.status(200).json({
                        "success": true,
                        "message": "Please subscribe first.",
                        "data": ""
                    });

            }
             
        });


});

router.get("/subscription", async (req, res, next) => {
    
    let { 

        msisdn,
        notifyType,
        category,
        validity

    } = req.query;

    let formated_msisdn = "880" + msisdn.substr(-10);
    const isValid = validateMsisdn(formated_msisdn);
    if (!isValid){
        return res.status(400).json({
            success: false,
            message: 'Invalid mobile no entered!',
            data: ''
        }); 
    }

    let getUserByMsisdn = `SELECT * FROM user_sub_status WHERE category=${category} && msisdn=${formated_msisdn}`;

    db.query(getUserByMsisdn, (err, userResult) => {
            if (err) {
                return res.status(500).send(err);
            }
            

            if(userResult.length){

        

                switch (notifyType) {
                  case 'sub':
                    doSubUpdate()
                    break;
                  case 'unsub':
                    doUnSubUpdate();
                    break;
                  default:
                    console.log('Check quary parameter');
                    return res.status(200).json("Invalid query parameter");
                }


            } else {


                switch (notifyType) {
                  case 'sub':
                    doSubscribeInsert()
                    break;
                  case 'unsub':
                    return res.status(200).json("Please subscribe first");
                    break;
                  default:
                    console.log('Check quary parameter');
                    return res.status(200).json("Invalid query parameter");
                }


            }


            async function doSubscribeInsert() {

                        let user_uuid = uuid();
                        let pack = validity;
                        validity = validity == 1 ? 1 : validity - 1;
                        let sub_status = 1;
                        let last_charge_at = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                        let created_at= dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                        let updated_at= dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                        //insert_sub
                        db.query(sub.subscribeInsert(user_uuid,formated_msisdn,category,pack,validity,sub_status,last_charge_at,created_at,updated_at), (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }

                            let url = ``;
                            request(url, function(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    console.log("Subscribe successfully.")
                                }
                                console.log(error)
                            });

                            var response = {
                               "sub_status": 1,
                               "msisdn": formated_msisdn
                            }
                            return res.status(200).json("Ok");

                        });


            }

            async function doUnSubUpdate() {

                    db.query(sub.unSubscribeUpdate(category,formated_msisdn), (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }

                        var response = {
                           "sub_status": 0,
                           "msisdn": formated_msisdn
                        }
                        return res.status(200).json("Ok");

                    });


            }

            async function doSubUpdate() {
                
                    var day = getNumberOfDays(new Date(),userResult[0].last_charge_at);

                    if(userResult[0].sub_status == 1 && day <= userResult[0].validity) {

                        var response = {
                           "sub_status": 1,
                           "msisdn": formated_msisdn
                        }

                        return res.status(200).json("already_subscribed");

                    } else {

                        let pack = validity;
                        validity = validity == 1 ? 1 : validity - 1;
                        let sub_status = 1;
                        let last_charge_at = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                        db.query(sub.subscribeUpdate(formated_msisdn,category,pack,validity,sub_status,last_charge_at), (err, result) => {

                            if (err) {
                                return res.status(500).send(err);
                            }

                            var response = {
                               "sub_status": 1,
                               "msisdn": formated_msisdn
                            }
                            return res.status(200).json("Ok");

                        });

                    }

            }

             
        });


});

router.post("/user_sub_status", async (req, res, next) => {
    
    let msisdn = req.body.msisdn;

    let formated_msisdn = "880" + msisdn.substr(-10);
    const isValid = validateMsisdn(formated_msisdn);
    if (!isValid){
        return res.status(400).json({
            success: false,
            message: 'Invalid mobile no entered!',
            data: ''
        }); 
    } 

        let getUserByMsisdn = `SELECT * FROM user_sub_status WHERE msisdn=${formated_msisdn}`;
        db.query(getUserByMsisdn, (err, userResult) => {
            if (err) {
                return res.status(500).send(err);
            }
            

            if(userResult.length){
                var day = getNumberOfDays(new Date(),userResult[0].last_charge_at);

                if(userResult[0].sub_status == 1 && day <= userResult[0].validity) {

                    var response = {
                       "sub_status": 1,
                       "msisdn": formated_msisdn
                    }

                    return res.status(200).json({
                        "success": true,
                        "message": "User Substatus.",
                        "data": response
                    });
                } else {
                    var response = {
                       "sub_status": 0,
                       "msisdn": formated_msisdn
                    }
                    return res.status(200).json({
                        "success": true,
                        "message": "User Substatus.",
                        "data": response
                    });
                }

            } else {

                    var response = {
                       "sub_status": 0,
                       "msisdn": formated_msisdn
                    }
                    return res.status(200).json({
                        "success": true,
                        "message": "User Substatus.",
                        "data": response
                    });

            }
             
        });


});

module.exports = router;