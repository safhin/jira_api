const express = require("express");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const request = require('request');
const fs = require('fs');
var dateFormat = require('dateformat');
const router = express.Router();
const redis = require('redis');
var axios = require('axios');
const client = redis.createClient(6379);
const config = require("../../config/base_url");
const apiUrl = config.apiurl;

router.get("/", async (req, res, next) => {

      try{

         let cacheUrl = apiUrl+'/api/cache-clear/cache_read';
         const response = await fetch(cacheUrl, { method: 'get' });
         const cacheRes = await response.json();
         const respon = await fetch(apiUrl+`/api/cache-clear/cache_write/${cacheRes.cache_id}`, { method: 'get' });
         const contents = await respon.json();

         client.flushdb( function (err, succeeded) {
             console.log("Clear Cache: "+succeeded);
             return res.status(200).json({ 
               success: true, 
               message: 'Successful cache clear.',
               data: succeeded

            });
         });   

      } catch (e) {

        res.status(501).json({
            "success": false,
            "message": "Something went wrong!!",
            "data": e.toString()
        });
    }
     
});


router.get("/cache_read", (req, res, next) => {

      try{


       fs.readFile('./cache.json', (err, data) => {
            if (err) throw err;
            let cacheData = JSON.parse(data);
            res.json(cacheData)
        });


      } catch (e) {

        res.status(501).json({
            "success": false,
            "message": "Something went wrong!!",
            "data": e.toString()
        });
    }
     
});


router.get('/cache_write/:id', (req, res, next) => {

    try {

        const cache_id = req.params.id;

        let cacheData = { 
            cache_id: parseInt(cache_id) + 1
        };
         
        let data = JSON.stringify(cacheData, null, 2);

        fs.writeFile('./cache.json', data, (err) => {
            if (err) {
                console.log(err)
                res.json(err)
            };
            console.log('Data written to file');
            res.json(cacheData)
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