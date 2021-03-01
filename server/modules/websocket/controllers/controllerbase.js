
class ControllweBase {
    constructor( router, { routerUrl, protocol }){
        this.router = router;
        this.routerUrl = routerUrl;
        this.protocol = protocol;
        this.intervals = 1000;
        this.prevData = {};
    }

    originIsAllowed(origin){
        
        //驗證網域
        if(origin){
            return true
        }
        
        return false;
    }

    ok(data) {
        console.log('ok')
    }

    error(err) {
        console.log('err')
    }    

    sendCallback(err) {
        if(err){
            _socketLogger.error('send() error: ' + err); 
        }
       
    }

    // send(model){
        
    //     const intervals = this.intervals;
    //     const originIsAllowed = this.originIsAllowed;
    //     const routerUrl = this.routerUrl;
    //     const protocol = this.protocol; 

    //     this.router.mount(routerUrl, protocol, function(request) {
            
    //         if(!originIsAllowed(request.origin)){
    //             request.reject();
    //             _socketLogger.error(' Connection from origin ' + request.origin + ' rejected.')
    //             return;                
    //         }
    //         // Should do origin verification here. You have to pass the accepted
    //         // origin into the accept method of the request.
    //         const connection = request.accept(request.origin);
    //         _socketLogger.info( protocol +' connection accepted from ' + connection.remoteAddress +
    //         ' - Protocol Version ' + connection.webSocketVersion);

    //         //定時發送
    //         connection.timerInterval = setInterval(async function() {
    //             try{
    //                 // if(!this.onDataChange(currData)){
    //                 //     return;
    //                 // }
                    
    //                 connection.send( model(), this.sendCallback);  
    //             }
    //             catch(err){
    //                 _socketLogger.error(err);
    //                 connection.drop()             
    //             }
    //         }, intervals);

    //         connection.on('close', function() {
    //             clearInterval(connection.timerInterval);            
    //         });

    //         connection.on('close', function(closeReason, description) {
    //             _socketLogger.info(' dumb-increment-protocol peer ' + connection.remoteAddress + ' disconnected, code: ' + closeReason + '.');
    //         });
            
    //     });         
    
    // }    

    onDataChange(currData){
        if(currData !== this.prevData){
            this.prevData = currData;  
            return true;   
        }

        return false;
    }

}

module.exports = ControllweBase;