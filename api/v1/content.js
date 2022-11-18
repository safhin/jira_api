const express = require("express");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const request = require('request');
const LogLater = require('../../utility/loggar');
const db = require("../../db/database");
const sql = require("../../domain/v1/content/sql");
var dateFormat = require('dateformat');
const router = express.Router();
var axios = require('axios');


const config = require("../../config/base_url");
const apiUrl = config.apiurl;


//FOR WEB
router.post("/create", async (req, res, next) => {
    const{title,description,status} = req.body;

    const task = {
        title,
        description,
        status,
    };
    db.query(sql.InsertTask(task), (err, data) => {
        if (!err) {
            if (data.length > 0) {
                console.log(data);
                return res.status(200).json(data);

            } else{
                 return res.status(200).json([]);
            }
        }
    });
});


router.post("/task/:id/:status", (req, res, next) => {
    let { id,status } = req.params;
    let{draggedItem, draggingPositionId} = req.body;

    db.query(sql.UpdateTask(id, status, draggedItem, draggingPositionId), (err, data) => {
        if (!err) {
            if (data.length > 0) {
                console.log(res.body)
                return res.status(200).json(res.body);

            } else{
                 return res.status(200).json({});
            }
        }
    });
            
});

router.post("/task/:id", (req, res, next) => {
    let { id } = req.params;

    db.query(sql.DeleteTask(id), (err, data) => {
        if (!err) {
            if (data.length > 0) {
                console.log(res.body)
                return res.status(200).json(res.body);

            } else{
                 return res.status(200).json({});
            }
        }
    });
            
});


router.get("/allTask", (req, res, next) => {
    try {
        db.query(sql.AllTaskSQL(), (err, data) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (data.length > 0) {
                return res.status(200).json(data);
            }else{
                return res.status(200).json(data);
            }
        });
    } catch (error) {
        return res.status(500).json(error);
    }
   
            
});


module.exports = router;