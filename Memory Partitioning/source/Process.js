module.exports =  class Process{

    constructor(name,size){
        if(typeof name ==='string' && typeof size ==='number'){
            this.name=name;
            this.size=size;
        }
        else {
            console.log('name and size are wrong in process !');
        }
    }

}