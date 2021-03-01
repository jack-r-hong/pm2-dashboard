const WebSocketServer = require('websocket').server;
const http = require('http');

const { wsServerLogger } = require('../log/logSetup');
global._socketLogger = wsServerLogger;
global._sleep = require('./bin/sleep');
global._temporaryData = {pm2List : {}, logFileList : {}};

const ControllersIndex = require('./controllers/controllersIndex');

//監聽uncaughtException，捕捉同步意外錯誤。
process.on('uncaughtException', (err) => {
    //紀錄訊息到log/error
    _socketLogger.error(`${err}\n `);
    console.error(err)

    //最好關閉伺服器，查修後重啟。

});

//監聽unhandledRejection，捕捉異步意外錯誤。
process.on('unhandledRejection', (err) => {
    _socketLogger.error(`${err}\n `);
    console.error(err)

});

const server = http.createServer(function(request, response) {
    _socketLogger.info(' Received request for ' + request.url)
    response.writeHead(404);
    response.end();
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

const controllersIndex = new ControllersIndex(wsServer);
controllersIndex.run();

function showConsole (host, port) {
    _socketLogger.info(`Websocket server is listening on ${host}:${port}`);
}

async function listenWebsocket(){
    try{
        const config = {
            host : '127.0.0.1',
            port : '4567',
        };
        server.listen(config.port, config.host, showConsole(config.host, config.port));          
    }
    catch (e) {
        _socketLogger.error(e.message);
        await _sleep(5000);
        listenWebsocket();
    }    
}


module.exports = listenWebsocket;






