const ControllerBase = require('./controllerBase');
const MainHomeModels = require('../models/mainHomeModels');
const uuid = require('uuid');

class MainHomeController extends ControllerBase {

    async mainHome(){
        const originIsAllowed = this.originIsAllowed;
        const routerUrl = this.routerUrl;
        const protocol = this.protocol;      

        
        const pm2 = await pm2Connect();
        pm2.list((err, list) => {
            list.forEach(ele => {
                pm2.flush(ele.name)
            });
        });
        
        const mainHomeModels = new MainHomeModels(pm2);
        //將以連線的資訊存入此陣列
        let connectionInfo = {};   

        setInterval(async() => {
            mainHomeModels.saveTemporaryData(); 
            mainHomeModels.getFirstTemporaryMainHome();                   
        }, 1000);        

        
        setInterval(async() => {
            Object.values(connectionInfo).forEach(connection => { 
                connection.connection.send( mainHomeModels.getFirstTemporaryMainHome(), this.sendCallback);                                                           
            });                      
        }, 1000);

        this.router.mount(routerUrl, protocol, function(request) {
            const connectionID = uuid.v4();
            
            if(!originIsAllowed(request.origin)){
                request.reject();
                _socketLogger.error(' Connection from origin ' + request.origin + ' rejected.')
                return;                
            }
            // Should do origin verification here. You have to pass the accepted
            // origin into the accept method of the request.
            const connection = request.accept(request.origin);
            _socketLogger.info( protocol +' connection accepted from ' + connection.remoteAddress +
            ' - Protocol Version ' + connection.webSocketVersion);

            connection.send( mainHomeModels.getFirstTemporaryMainHome(), this.sendCallback); 

            connectionInfo[connectionID] = {
                connection : connection
            };

            connection.on('message', function(message) {
                const data = JSON.parse(message.utf8Data);
                if(data.command === 'start'){
                    pm2.start(data.name, (err) => {console.log(err)});
                }   
                if(data.command === 'stop'){
                    pm2.stop(data.name, (err) => {console.log(err)});
                }                                
                if(data.command === 'restart'){
                    pm2.restart(data.name, (err) => {console.log(err)});
                }
                if(data.command === 'getLogsPath'){
                    mainHomeModels.getLogsPath(data.id).then(sendData => {
                        connection.send(sendData,this.sendCallback); 
                    });
                }     
                if(data.command === 'getLogs'){
                    mainHomeModels.getLogs(data.id , data.path, data.fileName).then(sendData => {
                        console.log(sendData)
                        connection.send(sendData,this.sendCallback); 
                    });
                }                     
                                                        
                
            });                 
                     
            connection.on('close', function() {
                delete connectionInfo[connectionID];    
            });
            
            connection.on('close', function(closeReason, description) {
                _socketLogger.info(' dumb-increment-protocol peer ' + connection.remoteAddress + ' disconnected, code: ' + closeReason + '.');
            });
            
        });  
    }
}

function pm2Connect(){
    const pm2 = require('pm2');
    return new Promise((res, rej) =>{
        pm2.connect(function(err) {
            if (err) {
                rej(err);
                _socketLogger.error(err);
                process.exit(2);
            }
            res(pm2);
            
        });          
    })

}



module.exports = MainHomeController;