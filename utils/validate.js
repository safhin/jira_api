function validateMsisdn(phoneString) {
    if (!phoneString || typeof phoneString !== 'string')
     throw new Error("Msisdn must e string number and it is required.")
    phoneString = '880' + phoneString.substr(-10);
    const regex = /(^(\88)(01)[123457689](\d){8})$/;
    return regex.test(phoneString);
}

function generateOtp() {
    return Math.floor(1000 + Math.random() * 8999).toString();
}

function uuid(){
    var dt = new Date().getTime();
    var uuid = 'xxxxx-xxxx-3xxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function getNumberOfDays(start, end) {
    const date1 = new Date(start);
    const date2 = new Date(end);

    // One day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;

    // Calculating the time difference between two dates
    const diffInTime = date2.getTime() - date1.getTime();

    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneDay);

    return diffInDays;
}

module.exports = { validateMsisdn,generateOtp,uuid,getNumberOfDays };