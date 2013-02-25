
var connectionIdTime = {

        "1" : false,
        "2" : false,
        "3" : false,
        "4" : false,
        "5" : false,
        "6" : false
    };

function timeDelayForConnection ( connectionID ) {

        setTimeout( function () {

                connectionIdTime[connectionID] = false ;

        }, delayForConnectionTime );
}

exports.timeDelayForConnection = timeDelayForConnection;
exports.conBoo = connectionIdTime;