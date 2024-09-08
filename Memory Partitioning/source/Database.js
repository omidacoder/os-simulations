module.exports = class Database {
    constructor(){
        Database.processes = [];
        Database.queues = [];
        Database.memory = null;
    }
    static init(){
        Database.processes = [];
        Database.queues = [];
        Database.memory = null;
    }
    static addProcess(p){
        Database.processes[Database.processes.length] = p;
    }
    static addQueue(q){
        Database.queues[Database.queues.length] = q;
    }
    static setMemory(m){
        Database.memory = m;
    }
    static getQueueProcesses(parts , i){
        let result =[];
        let upperBound = parts[i];
        let lowerBound = 0;

        for (let j = 0;j<parts.length;j++){
            console.log('size of process is : ' + parts[j]);
            if(parts[j] > lowerBound && parts[j] < upperBound){
                lowerBound = parts[j];
            }
        }
        console.log('upper is :' + upperBound + ' and lower is :' + lowerBound);
        //now we have upper and lower bounds
        for(let j = 0 ; j<Database.processes.length;j++){
            let process = Database.processes[j];
            if(process.size >lowerBound && process.size <= upperBound){
                result.push(process);
            }
        }
        console.log('result of queue processes is : ' + JSON.stringify(result));
        return result;
    }
};