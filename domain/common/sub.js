class UserSub {

    static subInsert(user_uuid,msisdn,category,pack,validity,sub_status,last_charge_at,created_at,updated_at) {

        let sql = `INSERT INTO 
                user_sub_status(
                    user_uuid,
                    msisdn,
                    category,
                    pack,
                    validity,
                    sub_status,
                    last_charge_at,
                    created_at,
                    updated_at)
                VALUES(
                 '${user_uuid}',
                 '${msisdn}',
                 '${category}',
                 '${pack}',
                  ${validity},
                 '${sub_status}',
                 '${last_charge_at}',
                 '${created_at}',
                 '${updated_at}')`;


        console.log(sql)

        return sql;
    }

    static subUpdate(msisdn,category,pack,sub_status,last_charge_at) {

        let sql = `UPDATE user_sub_status SET category='${category}',pack='${pack}',sub_status='${sub_status}',last_charge_at='${last_charge_at}', updated_at=NOW() where msisdn='${msisdn}'`;
        console.log(sql)
        return sql;

    }

    static unSubUpdate(msisdn) {

        let sql = `UPDATE user_sub_status SET sub_status='0',updated_at=NOW() where msisdn='${msisdn}'`;
        return sql;

    }

    static subscribeInsert(user_uuid,msisdn,category,pack,validity,sub_status,last_charge_at,created_at,updated_at) {

        let sql = `INSERT INTO 
                user_sub_status(
                    user_uuid,
                    msisdn,
                    category,
                    pack,
                    validity,
                    sub_status,
                    last_charge_at,
                    created_at,
                    updated_at)
                VALUES(
                 '${user_uuid}',
                 '${msisdn}',
                 '${category}',
                 '${pack}',
                  ${validity},
                 '${sub_status}',
                 '${last_charge_at}',
                 '${created_at}',
                 '${updated_at}')`;


        console.log(sql)

        return sql;
    }

    static subscribeUpdate(msisdn,category,pack,validity,sub_status,last_charge_at) {

        let sql = `UPDATE user_sub_status SET category='${category}',pack='${pack}',validity='${validity}',sub_status='${sub_status}',last_charge_at='${last_charge_at}', updated_at=NOW() where category='${category}' && msisdn=${msisdn}`;
        console.log(sql)
        return sql;

    }

    static unSubscribeUpdate(category,formated_msisdn) {

        let sql = `UPDATE user_sub_status SET sub_status='0',updated_at=NOW() where category='${category}' && msisdn=${formated_msisdn}`;
        console.log(sql)
        return sql;

    }

    static subCheck(formated_msisdn,category){
        let sql = `SELECT * FROM user_sub_status WHERE category=${category} AND msisdn=${formated_msisdn} AND sub_status=1`;
        console.log(sql)
        return sql;
    }

    static subscribeRenew(id,last_charge_at) {

        let sql = `UPDATE user_sub_status SET last_charge_at='${last_charge_at}', updated_at=NOW() where id='${id}'`;
        console.log(sql)
        return sql;

    }

    static unSubscribed(id) {
        
        let sql = `UPDATE user_sub_status SET sub_status='0',updated_at=NOW() where id='${id}'`;
        console.log(sql)
        return sql;

    }


}

module.exports = UserSub;