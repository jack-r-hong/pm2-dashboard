const { libviewServer, dataTrack } = require('config')
const net = require("net");

const client = new net.Socket();

client.setEncoding('utf8');


class TcpClient {
    constructor() {
        this.repeat = 0;
        this.errorCount = 0;
        this.maxErrorCount = 10;
    }

    connect() {
        let self = this;
        client.connect(libviewServer.port, libviewServer.host, function () {
            _socketLogger.info('Tcp server connected successfully on ' + client.remoteAddress + ':'+ client.remotePort);

            client.write('Hello');        
        });

        client.on('data', function (data) {
            self.errorCount += 0;
            if(dataTrack){
                _socketLogger.debug(data);
            }
            
            try {
                _temporaryData = isJsonString(data.split(data.split('{')[0])[1]) === true && JSON.parse(data.split(data.split('{')[0])[1]);
            }
            catch (err) {
                _socketLogger.error(err.message);
            }
        })

        client.on('error', function (err) {
            self.errorCount += 1;

            _socketLogger.error('與伺服器連線或通訊的過程中發生了一個錯誤，錯誤編碼為%s', err.code);
            
            if(self.errorCount > self.maxErrorCount){
                client.destroy();  
            }
        });

        client.on('close', async function (err) {

            if(self.repeat > 10){
                let error = new Error('超過重新連接上限，停止連線。')
                throw error;
            }

            if(!err){
                _socketLogger.info('Tcp server 主動斷開連結');
            }

            await _sleep(3000 + self.repeat * self.repeat * 3000);
            self.repeat += 1;
            _socketLogger.info('開始第' + self.repeat + '次重新連接');

            this.connect();            
        });        
    }
}


function isJsonString(str) {
    try {
        if (typeof JSON.parse(str) == "object") {
            return true;
        }
    } catch(e) {
        let err = new Error('The string from the server is not JSON');
        
        throw err;
    }
    return false;
}


module.exports = TcpClient;