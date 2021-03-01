const MainHomeController = require('./mainHomeController');

const WebSocketRouter = require('websocket').router;
const router = new WebSocketRouter();

class ControllersIndex  {
    constructor(wsServer){
        this.router = router;
        this.router.attachServer(wsServer);        
        this.controllersConfig = {           
            mainHomeController : {
                controller : MainHomeController,
                routerUrl : /^\/mainHome$/,
                // protocol : 'mainHome-protocol',
                action : 'mainHome',                 
            }          
        }
    }
    
    async run(){

        Object.keys(this.controllersConfig).map(item => {
            const {controller, routerUrl, protocol, action, parameters } = this.controllersConfig[item];          
            this.getRouter( controller, routerUrl, protocol, action, parameters);          
        });              
    }
    
    getRouter(Controller, routerUrl, protocol, action, parameters){
        const controller = new Controller(this.router, {routerUrl : routerUrl, protocol : protocol}, parameters);
        controller[action]();
    }
    
}

module.exports = ControllersIndex;