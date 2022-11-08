const express = require("express");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const request = require('request');
const LogLater = require('../../../utility/loggar');
const db = require("../../../db/database");
const sql = require("../../../domain/v1/content/sql");
var dateFormat = require('dateformat');
const router = express.Router();
const redis = require('redis');
var axios = require('axios');
const client = redis.createClient(6379);
const { validateMsisdn,generateOtp } = require("../../../utils/validate")
const config = require("../../../config/base_url");
const apiUrl = config.apiurl;

//FOR APP
router.post("/home", async (req, res, next) => {
    
        let playlist = apiUrl+'/api/app/v1/include/get-playlist';
        const contentInfoRedisKey = `home_app_comics`;



            return client.get(contentInfoRedisKey, (err, contentInfo) => {
                if (contentInfo) {
                    console.log('WEB : cache : All Items')
                    return res.json(JSON.parse(contentInfo));
                } else {
                    console.log('WEB : live : All Items')
                    doSomethingAsync();

                }

            });



            async function doSomethingAsync() {
                const response = await fetch(playlist, { method: 'get' });
                const data = await response.json();

                let items = [];
                for (let i = 0; i < data.Items.length; i++) {
                    const res = await fetch(apiUrl+`/api/app/v1/include/get-playlist-content/${data.Items[i].playlist_id}`, { method: 'get' });
                    const contents = await res.json();

                    console.log(contents.Items.length)
                    if(contents.Items.length>0){
                        items.push({
                            playlist_id: data.Items[i].playlist_id || "",
                            playlist_name: data.Items[i].playlist_name || "",
                            playlist_type: data.Items[i].playlist_type || "",
                            playlist_position: data.Items[i].playlist_position || "",
                            contents: contents.Items
                        })
                    }
                   
                }

                client.setex(contentInfoRedisKey, 24 * 60 * 60, JSON.stringify(items))
                return res.status(200).json(items);
            }


});


router.post("/details/:content_uid", (req, res, next) => {
    let { content_uid } = req.params;

    db.query(sql.ContentDetailSQL(content_uid), async (err, data) => {
        if (!err) {
            if (data.length > 0) {
                
                const content_response = await fetch(apiUrl+`/api/app/v1/include/get-related-content/${data[0].playlist_id}/${content_uid}`, { method: 'get' });
                const contents = await content_response.json();

                var response = {
                    "content_details": data[0],
                    "related_content": contents.Items
                }

                return res.status(200).json(response);

            } else{

                 return res.status(200).json({});
            }
        }
    });
            
});


router.post("/seeAll/:playlist_id", (req, res, next) => {

    let { playlist_id } = req.params;

        db.query(sql.ContentInfoSQL(playlist_id), (err, data) => {


            if (!err) {
                if (data.length > 0) {
                    
                    return res.status(200).json({"all_contents":data});

                }else{
                    
                    return res.status(200).json({"all_contents":[]});
                    
                }
            }


        });
            
});

router.post("/pack/list", (req, res, next) => {

        db.query(sql.PackListSQL(), (err, data) => {


            if (!err) {
                if (data.length > 0) {

                    var packList = [];
                    data.forEach(async (element) => { 
                        packList.push({
                                id: element.id,
                                pack_uid: element.pack_uid,
                                pack_name: element.pack_name,
                                price: element.price,
                                currency: element.currency,
                                isLoad: Boolean(element.isLoad),
                                url: element.url,
                                description: element.description.split(","),
                        });
                    });
                    
                    return res.status(200).json({"all_pack":packList});

                }else{
                    
                    return res.status(200).json({"all_pack":[]});
                    
                }
            }


        });
            
});

module.exports = router;