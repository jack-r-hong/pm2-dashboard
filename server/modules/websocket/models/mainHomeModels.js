const ModelBase = require('./modelBase');
const fs = require("fs");
const tar = require('tar')
const zlib = require('zlib');

class MainHomeModels extends ModelBase{
    constructor(pm2){
        super();
        this.pm2 = pm2;
    }

    saveTemporaryData(){
        const data = [];
        

        this.pm2.list((err, list) => {   
            // console.log(list)
            list.forEach(ele => {                
                let beforerEnd = 0;
                if(_temporaryData.logFileList[`${ele.pm_id}_${ele.name}`]){
                    beforerEnd = _temporaryData.logFileList[`${ele.pm_id}_${ele.name}`].beforerEnd;
                }
                const logFilePath = ele.pm2_env.pm_out_log_path;
                const errorFilePath = ele.pm2_env.pm_err_log_path;
                if(!_temporaryData.logFileList[`${ele.pm_id}_${ele.name}`]){
                    _temporaryData.logFileList[`${ele.pm_id}_${ele.name}`] = {
                        size : 0,
                        beforerEnd : 0,
                        log : []
                    };                          
                }

                fs.stat(logFilePath, function postStat(errStat, stats) {

                    if(_temporaryData.logFileList[`${ele.pm_id}_${ele.name}`].size === stats.size){
                        return;
                    }  
                    _temporaryData.logFileList[`${ele.pm_id}_${ele.name}`].size = stats.size;
                    fs.open(logFilePath, 'r', function postOpen(errOpen, fd) {
                      const loadLength = stats.size - beforerEnd;
                      fs.read(fd, Buffer.alloc(loadLength), 0, loadLength, beforerEnd, function postRead(errRead, bytesRead, buffer) {
                        if (errRead){
                            // console.log(err);
                            return;
                         }                                                 
                         _temporaryData.logFileList[`${ele.pm_id}_${ele.name}`].beforerEnd += bytesRead;
                         
                         
                         if(bytesRead > 0){
                            // console.log(buffer.toString('utf8'));
                            buffer.toString('utf8').split('\r\n').forEach(log => {
                                if(log !== ''){
                                    const subLog = log.substring(0, log.indexOf('{'));
                                    _temporaryData.logFileList[`${ele.pm_id}_${ele.name}`].log.push(subLog);
                                }
                            });                              
                            if(_temporaryData.logFileList[`${ele.pm_id}_${ele.name}`].log.length > 10){
                                _temporaryData.logFileList[`${ele.pm_id}_${ele.name}`].log.shift(); 
                            }                           
                         }
                      });
                    });
                });           
                // pm_err_log_path

                // pm2_env.pm_cwd 
                
                // ele.pm2_env.pm_cwd.logs
                

                data.push({
                    id : ele.pm_id,
                    name :  ele.name,
                    status : ele.pm2_env.status,
                    unstable_restarts : ele.pm2_env.unstable_restarts ,
                    pm_uptime : new Date(ele.pm2_env.pm_uptime),
                    pid :  ele.pid,
                    cpu : ele.monit.cpu,
                    memory: (ele.monit.memory / (1024 * 1024)).toFixed(1),
                    log : _temporaryData.logFileList[`${ele.pm_id}_${ele.name}`].log,
                    pmCwd : ele.pm2_env.pm_cwd,
                    logFilePath :logFilePath,
                    errorFilePath : errorFilePath,
                }); 

            });
                       
            _temporaryData.pm2List = data;            
        });        
        
    }
    
    getFirstTemporaryMainHome(){
        const data = {
            type : 'message',
            data : _temporaryData.pm2List
        };

        // console.log(data)
        return JSON.stringify(data)
             
    }      

    getLogsPath(id){
        return new Promise((res, rej) => {
            fs.stat(_temporaryData.pm2List[id].pmCwd + '/logs', async (errStat, stats) => {
                if(errStat){
                    const sendData = {
                        type : 'getLogsPath',
                        id : id,
                        path : {
                            logs : { 
                                path : 'logs',
                                file : [
                                    'out.log',
                                    'error.log',
                                ]  
                            }                            
                        }
                    }
                    res(JSON.stringify(sendData));
                    return;                
                }
                const path = {};
                const fsPromises = fs.promises;
                const dir = await fsPromises.readdir(_temporaryData.pm2List[id].pmCwd + '/logs'); 

                for(let i = 0; i < dir.length; i++ ){
                    const ele = dir[i];
                    path[ele] = {
                        path : ele,
                        file : []
                    };
                    const dir2 = await fsPromises.readdir(`${_temporaryData.pm2List[id].pmCwd}/logs/${ele}`);  
                    
                    dir2.forEach(fileName => {
                        const targetTest = /\.(log|log.gz)/;
                        if(targetTest.test(fileName)){
                            path[ele].file.push(fileName);
                        }
                    })                        
                }                 
                path.logs = { 
                    path : 'logs',
                    file : [
                        'out.log',
                        'error.log',
                    ]  
                };  
                const sendData = {
                    type : 'getLogsPath',
                    path : path,
                    id : id
                }
                
                res(JSON.stringify(sendData));                     

                // console.log(id)

                // fs.createReadStream('C:\\Users\\user\\Documents\\GitHub\\WDXB13_api\\wdxb13_api\\logs\\api\\api-2020-12-17.log.gz')
                // .pipe(zlib.createGunzip())
                // .on("data", function(data) {
                //     var chunk = data.toString();
                //     console.log(chunk);
                // });                

                // fs.open(ele.pm2_env.pm_cwd + '/logs/api/api-2020-12-17.log', 'r', (errOpen, fd) => {
                //     fs.read()
                // })
                // console.log(stats)

                // fs.readdir(ele.pm2_env.pm_cwd + '/logs/api',(err, dir) => {
                //     console.log(dir)
                // });     

            });
        });

        

    }

    getLogs(id ,path, fileName){
        return new Promise((res, rej) => {
            let fileData = [];
            if(fileName === 'out.log'){
                fs.stat(_temporaryData.pm2List[id].logFilePath, (errStat, stats) => {
                    if(errStat){
                        return;                
                    }
                    fs.readFile(_temporaryData.pm2List[id].logFilePath, (err, data) => {
                        if(err){
                            return;  
                        }
                        data.toString('utf8').split('\r\n').forEach(log => {
                            if(log !== ''){
                                fileData.push(log);
                            }
                        });                              

                        const sendData = {
                            type : 'getLogs',
                            data : fileData
                        }
                        res(JSON.stringify(sendData));                        

                    })

                });       
                return;          
            }
            if(fileName === 'error.log'){
                fs.stat(_temporaryData.pm2List[id].errorFilePath, (errStat, stats) => {
                    if(errStat){
                        return;                
                    }
                    fs.readFile(_temporaryData.pm2List[id].errorFilePath, (err, data) => {
                        if(err){
                            return;  
                        }
                        data.toString('utf8').split('\r\n').forEach(log => {
                            if(log !== ''){
                                fileData.push(log);
                            }
                        });                              

                        const sendData = {
                            type : 'getLogs',
                            data : fileData
                        }
                        res(JSON.stringify(sendData));                        

                    })

                });     
                return;           
            }        
            const fileNameIsLogTest = /\.log$/;
            const fileNameIsLoggzTest = /\.log.gz$/;
            const filePath = `${_temporaryData.pm2List[id].pmCwd}\\logs\\${path}\\${fileName}`;
            if(fileNameIsLoggzTest.test(fileName)){
                fs.stat(filePath, (errStat, stats) => {
                    if(errStat){
                        return;                
                    }
                    fs.createReadStream('C:\\Users\\user\\Documents\\GitHub\\WDXB13_api\\wdxb13_api\\logs\\api\\api-2020-12-17.log.gz')
                    .pipe(zlib.createGunzip())
                    .on("data", function(data) {
                        data.toString('utf8').split('\r\n').forEach(log => {
                            if(log !== ''){
                                fileData.push(log);
                            }
                        });                                  
                        const sendData = {
                            type : 'getLogs',
                            data : fileData
                        }
                        res(JSON.stringify(sendData));                           
                        
                    });  


                });       
                return;    
            }                 
            if(fileNameIsLogTest.test(fileName)){
                fs.stat(filePath, (errStat, stats) => {
                    if(errStat){
                        return;                
                    }
                    fs.readFile(filePath, (err, data) => {
                        if(err){
                            return;  
                        }
                        data.toString('utf8').split('\r\n').forEach(log => {
                            if(log !== ''){
                                fileData.push(log);
                            }
                        });                              

                        const sendData = {
                            type : 'getLogs',
                            data : fileData
                        }
                        res(JSON.stringify(sendData));                        

                    })

                });       
                return;    
            }    
        });
        
    }
}



module.exports = MainHomeModels;



