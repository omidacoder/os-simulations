module.exports =  class Memory{

    constructor(method,size,partitions){
        //method : 'UNEQUAL' , 'EQUAL' , 'EX'
        this.method=method;
        this.size = size;
        this.processes = []; // هر کلید پارتیشن مربوطه را مشخص میکند
        this.partitions = partitions;
    }
    setProcess(p){
        // console.log('p in process is :' + JSON.stringify(p));
        //returns index
        let index = -1;
        if(p.size > Math.max(this.partitions)){
            //overlaying will happen
            return index;
        }
        //finding place of this process
        let condition = false;
        // console.log('partitions are :' +  JSON.stringify(this.partitions));
        // console.log('processes are :' + JSON.stringify(this.processes));
        //lets sort the partitions
        // this.sort(this.partitions);
        for(let i = 0 ; i<this.partitions.length;i++){
            if(p.size <= this.partitions[i] && this.processes[i] === undefined){
                //we can put this process here
                this.processes[i] = p;
                index = i;
                condition = true;
                break;
            }
        }
        if(!condition){
            alert('memory is full');
            return index;
        }
        return index;

    }
    processCount = (index)=>{
        let counter = 0;
        for (let i = 0 ; i<index;i++){
            if(this.processes[i] !== null && this.processes[i] !== undefined){
                if( this.processes[i].size !== this.partitions[i]) counter++
            }
        }
        return counter;
    };

};