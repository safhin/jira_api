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

const config = require("../../../config/base_url");
const apiUrl = config.apiurl;

//all_playlist
//additional
router.get("/get-playlist", (req, res, next) => {
  
           db.query(sql.PlaylistInfoSQL(), (err, data) => {
                if (err) {
                    return res.status(500).send(err);
                }
                if (data.length > 0) {
                      
                    return res.status(200).json({"Items":data});

                }else{
                       return res.status(200).json({"Items":[]});
                }
               
           });
        
});

//get_playlist_content_by_playlist_id
//additional
router.get("/get-playlist-content/:playlist_id", (req, res, next) => {

    let { playlist_id } = req.params;

                        db.query(sql.ContentInfoSQL(playlist_id), (err, data) => {
                            //console.log(err)
                            if (!err) {
                                if (data.length > 0) {
                                      return res.status(200).json({"Items":data});
                                }else{
                                    return res.status(200).json({"Items":[]});
                                }
                            }
                        });
            
});

router.get("/get-related-content/:playlist_id/:content_uid", (req, res, next) => {

    let { playlist_id, content_uid } = req.params;

                        db.query(sql.RelatedContentInfoSQL(playlist_id,content_uid), (err, data) => {
                            //console.log(err)
                            if (!err) {
                                if (data.length > 0) {
                                      return res.status(200).json({"Items":data});
                                }else{
                                    return res.status(200).json({"Items":[]});
                                }
                            }
                        });
            
});

module.exports = router;