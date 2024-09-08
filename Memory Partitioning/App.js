//Here Are Some Functions That Use Other Classes
const Kernel = require('./source/Kernel');
let equalms = document.getElementById('equal-memory-size');
let uneqalms = document.getElementById('unequal-memory-size');
let expartition =document.getElementById('ex-pow');
let unequalpartition = document.getElementById('unequal-partition');
let equalpartition = document.getElementById('equal-partition');
let processSection = document.getElementById('processes');
// let q = document.getElementById('queues');
let m = document.getElementById('memory');
const util=new Kernel(equalms , uneqalms , expartition , equalpartition , processSection,m);
function unequalStart() {

    util.unequalStart(unequalpartition.value);
}
function equalStart() {
    util.equalStart();
}
function exStart() {
    //get parts here later
    if(!isNaN(Number(expartition.value))) {
        let pow = Number(expartition.value);
        let parts = '';
        for (let i = 1;i<pow;i++){
            parts+=Math.pow(2,i).toString();
            if(i !== pow-1)
                parts+=',';
        }
        console.log('parts are : '+ parts);
        util.unequalStart(parts, true);
    }
}
function addProcess(){
    util.addProcess();
}