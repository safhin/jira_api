class UserOtp {

    static otpInsertSQL(msisdn,send_time,expired_time,secret_key,operator,verify_status,created_at,updated_at) {

        let sql = `INSERT INTO 
                otp_verification(
                    msisdn,
                    send_time,
                    expired_time,
                    secret_key,
                    operator,
                    verify_status,
                    created_at,
                    updated_at)
                VALUES(
                 '${msisdn}',
                 '${send_time}',
                 '${expired_time}',
                 '${secret_key}',
                 '${operator}',
                 '${verify_status}',
                 '${created_at}',
                 '${updated_at}')`;

        return sql;
    }

    static otpUpdate(id) {

        let sql = `UPDATE otp_verification SET verify_status='1', updated_at=NOW() where id='${id}'`;
        return sql;

    }

}

module.exports = UserOtp;