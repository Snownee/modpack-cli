var readline = require('readline');

exports.read = async (que)=>{
    return new Promise(((resolve, reject) =>{
        const rl = readline.createInterface({
            input:process.stdin,
            output:process.stdout
        });

        rl.question(que,function(answer){
            rl.close();
            resolve(answer)
        });
    }))

}
