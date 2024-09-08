module.exports = class Queue {
    constructor(){
        this.data = [];
        this.size = 0;
    }
    enqueue(process){
        console.log(typeof process);
        this.data[this.size] = process;
        this.size++;
    }
    dequeue(){
        if (this.size === 0){
            throw new Error();
        }
        let result = this.data[0];
        for(let i = 1 ;i<=this.size;i++){
            this.data[i-1] = this.data[i];
        }
        this.size--;
        return result;
    }
};