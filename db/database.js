const mysql = require("mysql");
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 1000,
    host: '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    charset: 'utf8mb4',
    debug: false
});

function executeQuery(sql, callback) {
    pool.getConnection((err, connection) => {

        if (err) {
            return callback(err, null);

        } else {

            if (connection) {
                connection.query(sql, function(error, results, fields) {
                    connection.release();
                    if (error) {
                        return callback(error, null);
                    }
                    return callback(null, results);
                });
            }
        }
    });
}

function query(sql, callback) {
    executeQuery(sql, function(err, data) {
        if (err) {
            return callback(err);
        }
        callback(null, data);
    });
}

module.exports = {
    query: query
}