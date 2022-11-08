var fs = require('fs');
var system = {
    getOperatorName: function (operator)
    {
        if (
            operator.substr(0, 3) === '018'
            || operator.substr( 0, 5) === '88018'
            || operator.substr( 0, 6) === '+88018'
        ) {
            return 'robi';
        } else if (
            operator.substr(0, 3) === '016'
            || operator.substr( 0, 5) === '88016'
            || operator.substr( 0, 6) === '+88016'
        ) {
            return 'airtel';
        } else if (
            operator.substr(0, 3) === '019'
            || operator.substr( 0, 5) === '88019'
            || operator.substr( 0, 6) === '+88019'
        ) {
            return 'blink';
        } else if (
            operator.substr(0, 3) === '014'
            || operator.substr( 0, 5) === '88014'
            || operator.substr( 0, 6) === '+88014'
        ) {
            return 'blink';
        } else {
            return 'NO_MSISDN';
        }
    },

    readFile : function(filename){

       try{
            let stats = fs.statSync(filename);
            if(stats.isFile()){
                console.log('Found');
                try {
                    const data = fs.readFileSync(filename, 'utf8')
                    console.log(data);
                    return data;
                } catch (err) {
                    console.error(err)
                    return -1;
                }
            }else{
                console.log('NOT');
                return -1;
            }
        }catch(err) {
            console.log('it does not exist');
            return -1;
        }
        
                       
        
    }
};
module.exports = system