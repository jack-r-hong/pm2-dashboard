const EventEmitter = require('events').EventEmitter; 
const event = new EventEmitter(); 

module.exports = {
    onWorkpieceStatusTableChange(fun) {
        event.on('workpieceStatusTableChange', function(dataIndex, data) { 
            fun(dataIndex, data)
        });        
    },

    emitWorkpieceStatusTableChange(dataIndex, data) {
        event.emit('workpieceStatusTableChange', dataIndex, data); 
    }     
};