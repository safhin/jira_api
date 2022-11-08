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

router.get("/", async (req, res) => {

    try{

        /*Log Init*/
        var asiaTime = new Date().toLocaleString('en-BN', { timeZone: 'Asia/Dhaka' });
        var log_date = dateFormat(asiaTime, "yyyy-mm-dd");
        var logfile_access = new LogLater('logs/access-log-' + log_date+ '.log');
        var logfile_error = new LogLater('logs/error-log-' + log_date + '.log');
        var logfile_subSync = new LogLater('logs/subSync-log-' + log_date+ '.log');
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        logfile_access.dateline(req.hostname + " | "+fullUrl + " | "+req.get('user-agent'));



        let formated_msisdn='NO_MSISDN';
        if(req.query && req.query.msisdn){
            formated_msisdn =  '880' + req.query.msisdn.substr(-10);
        }else{
            formated_msisdn =  req.msisdn?'880' + req.msisdn.substr(-10):"NO_MSISDN";
        }

        if(formated_msisdn == "NO_MSISDN")
            throw new Error('MSISDN rquired')

        let NotifyType = typeof(req.query.NotifyType) != "undefined"  ? req.query.NotifyType: '';
            if(NotifyType.length==0)
                throw new Error('NotifyType rquired')

        let category = typeof(req.query.category) != "undefined"  ? req.query.category: 6;
            if(category.length==0)
                throw new Error('category rquired')

        
        let validity = typeof(req.query.validity) != "undefined"  ? parseInt(req.query.validity): '';
        if(NotifyType.toLowerCase() !='unsub'){
            if(validity.length==0)
                throw new Error('validity rquired')
        }

        if(category =='999'){
            category=6;
        }
        

        const isValid = validateMsisdn(formated_msisdn);
        if (!isValid){
            return res.status(501).json({
                status: 501,
                message: 'Invalid mobile no entered!'
            }); 
        }

        /*Logwrite*/ 
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        logfile_subSync.dateline(formated_msisdn + " | "+ fullUrl + " | "+req.get('user-agent'));



        

        db.query(sub.subCheck(formated_msisdn,category), (err, userResult) => {
                if (err) {
                    return res.status(500).send(err);
                }
                

                if(userResult.length){
                    
                    switch (NotifyType.toLowerCase()) {
                    case 'sub':
                        doSubUpdate()
                        break;
                    case 'unsub':
                        doUnSubUpdate();
                        break;
                    default:
                        console.log('Invalid Notify type');
                        return res.status(200).json("Invalid Notify type");
                    }


                } else {


                    switch (NotifyType.toLowerCase()) {
                    case 'sub':
                        doSubscribeInsert()
                        break;
                    case 'unsub':
                        return res.status(200).json("msisdn not found");
                        break;
                    default:
                        console.log('Invalid Notify type');
                        return res.status(200).json("Invalid Notify type");
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

                                var response = {
                                "sub_status": 1,
                                "msisdn": formated_msisdn
                                }
                                return res.status(200).json("Ok");

                            });


                }

                async function doUnSubUpdate() {

                        db.query(sub.unSubscribed(userResult[0].id), (err, result) => {
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

                    console.log('GET',userResult);
                    
                    let last_charge_at = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                    db.query(sub.subscribeRenew(userResult[0].id,last_charge_at), (err, result) => {

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

                
            });

    }catch (err) {
        logfile_error.dateline(req.hostname + " | "+ fullUrl +" | "  + err.message +err.stack+ " | "+req.get('user-agent'));
        return res.status(501).json(err.message); 
    }
});

router.get("/unsub", async (req, res) => {

    try{

        /*Log Init*/
        var asiaTime = new Date().toLocaleString('en-BN', { timeZone: 'Asia/Dhaka' });
        var log_date = dateFormat(asiaTime, "yyyy-mm-dd");
        var logfile_access = new LogLater('logs/access-log-' + log_date+ '.log');
        var logfile_error = new LogLater('logs/error-log-' + log_date + '.log');
        var logfile_unsub = new LogLater('logs/unsub-log-' + log_date+ '.log');
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        logfile_access.dateline(req.hostname + " | "+fullUrl + " | "+req.get('user-agent'));

        let formated_msisdn='NO_MSISDN';
        if(req.query && req.query.msisdn){
            formated_msisdn =  '880' + req.query.msisdn.substr(-10);
        }else{
            formated_msisdn =  req.msisdn?'880' + req.msisdn.substr(-10):"NO_MSISDN";
        }

        if(formated_msisdn == "NO_MSISDN")
            throw new Error('MSISDN rquired')

        let operator = typeof(req.query.operator) != "undefined"  ? req.query.operator: System.getOperatorName(formated_msisdn);
        if(operator.length==0)
                throw new Error('operator rquired')

        const isValid = validateMsisdn(formated_msisdn);
        if (!isValid){
            return res.status(501).json({
                status: 501,
                message: 'Invalid mobile no entered!',
            }); 
        }
        

        /*Logwrite*/

        var unsubUrl='';
        if(operator=='blink'){
            unsubUrl = `http://103.4.145.85/service/SDP/6D/LTECH/subscriptionManger/unSubscriptionAPI.php?pack=1&service=mcomics&msisdn=${formated_msisdn}&channel=Web`;
        }else if(operator=='robi'){
            unsubUrl = `http://103.4.145.99/service/SDP/Subscription_API/soap/3rdPartyUnSub_API.php?Username=follo&Password=follo28777&category=6&to=${formated_msisdn}&shortcode=21252`;
        }else{
            return res.status(501).json({
                status: 501,
                message: "Invalid mobile operator"
            });
        }

    
        //let unsubUrl = `http://103.4.145.99/service/SDP/Subscription_API/soap/3rdPartyUnSub_API.php?Username=follo&Password=follo28777&category=6&to=${formated_msisdn}&shortcode=21252`;
        const get_data = async unsubUrl => {
            try {
                const response = await fetch(unsubUrl);
                const result = await response.text();
                var callBackStatus = result;
                console.log('Unsub',callBackStatus);
                logfile_unsub.dateline(`MSISDN: ${formated_msisdn} | Shortocde:  21252 | Pack : 1 | Response: ${callBackStatus} | URL: ${unsubUrl}`);

                //CallBackStatusUpdate
                return res.status(200).json({
                    status: 200,
                    message: 'Unsubscription successfully completed.'
                }); 
                
            
            } catch (err) {
                logfile_error.dateline(formated_msisdn + " | "+ fullUrl +" | "  + err.message +err.stack+ " | "+req.get('user-agent'));
                return res.status(501).json({
                    status: 501,
                    message: err.message
                }); 
            }
        };
        get_data(unsubUrl);

    }catch (err) {
        logfile_error.dateline(req.hostname + " | "+ fullUrl +" | "  + err.message +err.stack+ " | "+req.get('user-agent'));
        return res.status(501).json({
            status: 501,
            message: err.message
        }); 
    }
});

router.get("/subCheck", async (req, res) => {

    try{

        /*Log Init*/
        var asiaTime = new Date().toLocaleString('en-BN', { timeZone: 'Asia/Dhaka' });
        var log_date = dateFormat(asiaTime, "yyyy-mm-dd");
        var logfile_access = new LogLater('logs/access-log-' + log_date+ '.log');
        var logfile_error = new LogLater('logs/error-log-' + log_date + '.log');
        var logfile_subcheck = new LogLater('logs/subcheck-log-' + log_date+ '.log');
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        logfile_access.dateline(req.hostname + " | "+fullUrl + " | "+req.get('user-agent'));
        
        let formated_msisdn='NO_MSISDN';
        if(req.query && req.query.msisdn){
            formated_msisdn =  '880' + req.query.msisdn.substr(-10);
        }else{
             formated_msisdn =  req.msisdn ?'880' + req.msisdn.substr(-10):"NO_MSISDN";
        } 
        console.log('Sub-MSISDN',formated_msisdn)
        //let formated_msisdn = req.query && req.query.msisdn ? '880' + req.query.msisdn.substr(-10): req.msisdn;
        if(formated_msisdn == "NO_MSISDN")
            throw new Error('MSISDN rquired')

        let operator = System.getOperatorName(formated_msisdn);
        if(operator.length==0)
                throw new Error('operator rquired')

        const isValid = validateMsisdn(formated_msisdn);
        if (!isValid){
            return res.status(501).json({
                status: 501,
                message: 'Invalid mobile no entered!',
            }); 
        }
        

        /*Logwrite*/ 
        let category=6;
        db.query(sub.subCheck(formated_msisdn,category), (err, userResult) => {
            if (err) {
                return res.status(501).send({
                    status: 501,
                    message: 'DB Eror',
                });
            }
            let response ={
                msisdn: formated_msisdn,
                operator: operator,
                subscribeStatus: (userResult.length)?1:0,
            };
       
            logfile_subcheck.dateline('MSISDN:'+formated_msisdn+' | Res:'+JSON.stringify(response));
            return res.status(200).json(response);
            
        });

    }catch (err) {
        logfile_error.dateline(req.hostname + " | "+ fullUrl +" | "  + err.message +err.stack+ " | "+req.get('user-agent'));
        return res.status(501).json({
            status: 501,
            message: err.message
        }); 
    }
});

module.exports = router;