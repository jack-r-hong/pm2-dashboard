const config = require('config');

class dbQuery {
    connect(){
        // _socketLogger.info('資料庫連線成功')
    }

    close(){
        // _socketLogger.info('資料庫連線關閉')
    }

    getHostAndPort(){
        return(
            new Promise((resolve, reject) => {
                this.connect();         
                if(false){
                    reject('資料庫連線失敗，三秒後重新連線'); 
                    return ;
                }
            
                resolve(
                    {
                        host: config.get('webSocketServer').host,
                        port: config.get('webSocketServer').port,

                    }
                );
                this.close();
    
    
            })
        )        
    }

    getUrlAndProtocol(){
        return(
            new Promise((resolve, reject) => {
                this.connect()
                if( false ){
                    reject('資料庫連線失敗，三秒後重新連線');         
                    return ;
                }
         
                resolve(
                    [
                        // {
                        //     page : "mainPage",
                        //     action : "indicatorLight",
                        //     routerUrl : '/home/indicatorLight',
                        //     protocol : 'indicatorLight-protocol',
                        // }                 

                    ]
                );
                this.close();
    
    
            })
        )            
    }
}

module.exports = dbQuery;