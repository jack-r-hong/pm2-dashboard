
const getHostAndPort = () => {
    return(
        new Promise((resolve, reject) => {
            if(false){
                reject('error') 
                return ;
            }
     

            resolve(
                {
                    host: '127.0.0.1',
                    port: 8078,
                }
            )


        })
    )
}

module.exports = getHostAndPort;