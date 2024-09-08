const Process = require('./Process');
const Queue = require('./Queue');
const Database = require('./Database');
const Memory = require('./Memory');
module.exports =  class Kernel {
    constructor(equalms , unequalms , expart , equalpartition , processSection  , memorySection){
        this.equalMemorySize = equalms;
        this.unequalMemorySize = unequalms;
        this.equalPartition = equalpartition;
        this.processSection = processSection;
        this.memorySection = memorySection;
        this.exPartition = expart;
        this.processCounter = 0;
        let processColumns = document.createElement('div');
        processColumns.classList.add('columns');
        this.processSection.appendChild(processColumns);
        this.currentProcessColumns = processColumns;
        Database.init();
    }
    drawQueue(processes , title){
        let queue = document.createElement('table');
        let tbody = document.createElement('tbody');
        queue.appendChild(tbody);
        queue.classList.add('table');
        let tr = document.createElement('tr');
        tbody.appendChild(tr);
        let q = new Queue();
        let td = document.createElement('td');
        td.innerHTML = '<h1>'+title+'</h1>';
        tr.appendChild(td);
        // q.enqueue();
        for (let i = 0 ; i<processes.length;i++){
            let td = document.createElement('td');
            td.innerHTML = '<h1>'+processes[i].name+'</h1>'+'<p>'+processes[i].size+' MB</p>';
            tr.appendChild(td);
            q.enqueue(processes[i]);
        }
        Database.addQueue(q);
        return queue;
    }

    unequalStart = (partitions , isEx = false ) =>{
        this.memorySection.innerHTML = ''; let ismulti = null;
        if(!isEx) ismulti = document.getElementById('unequal-select').selectedIndex !== 0;
        else ismulti = document.getElementById('ex-select').selectedIndex !== 0;
        //lets get partitions
        let parts = partitions.split(',');
        let sum = 0;
        for(let i = 0 ; i<parts.length;i++){
            if(isNaN(Number(parts[i]))){
                alert('wrong partitions');
                return;
            }
            parts[i] = Number(parts[i]);
            sum += parts[i];

        }
        //have to be sure about sizes
        if(!isEx && isNaN(Number(this.unequalMemorySize.value))) {alert('error in memory size'); return;}
        if(isEx && isNaN(Number(this.exPartition.value))){alert('error in power');return;}
        let memorySize  = isEx ? sum: Number(this.unequalMemorySize.value);
        // console.log('sum is : '+sum);
        if(memorySize !== sum){alert('error in inputs');return;}
        //every thing is right
        //Omid Davar : disabling start buttons
        document.getElementById('equal-start').disabled = true;
        document.getElementById('unequal-start').disabled = true;
        document.getElementById('ex-start').disabled = true;
        //setting Memory
        const databaseMemory = new Memory('UNEQUAL',memorySize , parts);
        Database.setMemory(databaseMemory);
        //now lets draw the memory
        let memory = document.createElement('table');
        this.memorySection.appendChild(memory);
        memory.classList.add('table');
        memory.style.marginLeft = "60px";
        let tbody = document.createElement('tbody');
        tbody.id='memory-body';
        memory.appendChild(tbody);
        let cells = [];
        //let make cells
        for (let i = 0 ; i<parts.length;i++){
            cells[i] = document.createElement('tr');
            cells[i].classList.add('is-selected');
            cells[i].style.height = (cells[i].clientHeight *2).toString() + 'px';
            let td = document.createElement('td');
            // td.style.padding = "20px";
            td.style.padding = '30px';
            td.textAlign = 'center';
            td.innerHTML = '<h1>'+parts[i]+'</h1>';
            cells[i].appendChild(td);
            tbody.appendChild(cells[i]);
        }
        let h = tbody.clientHeight;
        for (let i = 0 ; i<parts.length ; i++){
            cells[i].style.height = (parts[i]*h/sum).toString()+'px';
        }
        if (!ismulti){
            let tableHeight = memory.clientHeight;
            let singleQueueMarginTop = tableHeight/2-tableHeight/2/parts.length;
            let singleQueue = this.drawQueue(Database.processes , 'Single Queue');
            singleQueue.style.marginTop = singleQueueMarginTop.toString() + 'px';
            singleQueue.style.marginLeft = '50px';
            singleQueue.id = 'sq';
            this.memorySection.appendChild(singleQueue);
            //setting the counter
            let mycounter = document.getElementById('my-counter');
            mycounter.innerText='Starting in 5 Seconds';
            this.startCounting();
            this.startJob(0,false);
        }
        else{
            //we need to draw queues as much as partitions
            let i = 0;
            let queueSection = document.createElement('div');
            this.memorySection.appendChild(queueSection);
            queueSection.style.display = 'flex';
            queueSection.style.flexDirection = 'column';
            queueSection.style.justifyContent = 'flex-start';
            while(i<parts.length){
                let queueProcesses = Database.getQueueProcesses(parts , i); //here should return processes that are between i and the one smaller than i
                // console.log('processes returned for queue '+i+' is : '+JSON.stringify(queueProcesses));
                let drawQueue = this.drawQueue(queueProcesses , 'Queue');
                drawQueue.style.marginLeft = '50px';
                drawQueue.id='mq'+i.toString();
                drawQueue.style.flex = (1/parts.length).toString();
                queueSection.appendChild(drawQueue);
                if (i !== 0){drawQueue.parentNode.insertBefore(document.createElement('br') , drawQueue)}
                let backendQueue = new Queue();
                for(let i = 0 ; i<queueProcesses.length;i++){
                    backendQueue.enqueue(queueProcesses[i]);
                }
                i++;
            }
            // memory.style.height = '100%';
            console.log('Queues : ' + JSON.stringify(Database.queues));
            this.startCounting();
            this.startMultiJob();

        }
    };
    equalStart = () =>{
        this.memorySection.innerHTML = '';
        let ismulti = document.getElementById('equal-select').selectedIndex !== 0;
        if(isNaN(Number(this.equalMemorySize.value)) || isNaN(Number(this.equalPartition.value))){
            alert('error in size enterance');
            return;
        }
        if(Number(this.equalMemorySize.value) % Number(this.equalPartition.value )!== 0)
        {
            alert('error in size enterance');
            return;
        }
        // disabling start buttons
        document.getElementById('equal-start').disabled = true;
        document.getElementById('unequal-start').disabled = true;
        document.getElementById('ex-start').disabled = true;
        let tedad = Number(this.equalMemorySize.value) / Number(this.equalPartition.value);
        //tedad is integer now
        //setting Memory
        const partitions = [];
        for (let i =0 ; i<tedad;i++){
            partitions[partitions.length] = Number(this.equalPartition.value );
        }
        const databaseMemory = new Memory('EQUAL',Number(this.equalMemorySize.value) , partitions);
        Database.setMemory(databaseMemory);
        //now lets draw the memory
        let memory = document.createElement('table');
        this.memorySection.appendChild(memory);
        memory.classList.add('table');
        memory.style.marginLeft = "60px";
        let tbody = document.createElement('tbody');
        tbody.id='memory-body';
        memory.appendChild(tbody);
        let cells = [];
        //let make cells
        for (let i = 0 ; i<tedad;i++){
            cells[i] = document.createElement('tr');
            cells[i].classList.add('is-selected');
            let td = document.createElement('td');
            td.style.padding = "20px";
            td.textAlign = 'center';
            td.innerHTML = '<h1>'+Number(this.equalPartition.value)+'</h1>';
            cells[i].appendChild(td);
            tbody.appendChild(cells[i]);
        }
        //lets draw the queues
        if(!ismulti){
            let tableHeight = memory.clientHeight;
            let singleQueueMarginTop = tableHeight/2-tableHeight/2/tedad;
            let singleQueue = this.drawQueue(Database.processes , 'Single Queue');
            singleQueue.style.marginTop = singleQueueMarginTop.toString() + 'px';
            singleQueue.style.marginLeft = '50px';
            singleQueue.id = 'sq';
            this.memorySection.appendChild(singleQueue);
            //setting the counter
            let mycounter = document.getElementById('my-counter');
            mycounter.innerText='Starting in 5 Seconds';
            this.startCounting();
            this.startJob();
        }
        else{
            //we need to draw tedad queues
        //     for (let i = 0 ; i<tedad;i++){
        //         let Queue = this.drawQueue([Database.processes[i]] , 'Queue');
        //         Queue.style.marginLeft = '50px';
        //         Queue.id = 'q'+i;
        //         this.memorySection.appendChild(Queue);
        //
        //     }
        //     let mycounter = document.getElementById('my-counter');
        //     mycounter.innerText='Starting in 5 Seconds';
        //     this.startCounting();
        //     this.multipleStartJob();
        //
            alert('multiple queue is not supported for equal partitioning');
         }




    };
    addProcess = () =>{
        if(this.processCounter % 5 === 0 && this.processCounter !== 0)
        {
            this.currentProcessColumns = document.createElement('div');
            this.currentProcessColumns.classList.add('columns');
            this.processSection.appendChild(this.currentProcessColumns);
        }
        let title = document.createElement('h1');
        title.innerHTML='P'+this.processCounter;
        let newProcess = document.createElement('div');
        newProcess.style.backgroundColor = 'yellow';
        newProcess.style.borderRadius = '1000px';
        newProcess.classList.add('column');
        newProcess.classList.add('is-2');
        newProcess.style.padding = '30px';
        newProcess.style.margin = '20px';
        newProcess.style.textAlign = 'center';
        newProcess.style.display = 'flex';
        newProcess.style.flexDirection = 'column';
        newProcess.style.justifyContent = 'center';
        newProcess.style.alignItems = 'center';
        //making inputs
        let nameInput = document.createElement('input');
        let sizeInput = document.createElement('input');
        //making save button
        let saveButton = document.createElement('button');
        saveButton.innerHTML = 'save';
        saveButton.classList.add('button');
        saveButton.classList.add('is-dark');
        saveButton.id = 'save'+this.processCounter;
        let counter = this.processCounter;
        saveButton.addEventListener("click" , function () {
            let nameOfP = document.getElementById('name'+counter);
            let sizeOfP = document.getElementById('size'+counter);
            if(sizeOfP.value !== '' && nameOfP.value !== '' && !isNaN(Number(sizeOfP.value )))
                Database.addProcess(new Process(nameOfP.value, Number(sizeOfP.value)));
            else {
                alert('error in inputs');
                return;
            }
            newProcess.removeChild(nameOfP);
            newProcess.removeChild(sizeOfP);
            newProcess.removeChild(document.getElementById('save'+counter));
            let newName = document.createElement('h1');
            let newSize = document.createElement('h1');
            newProcess.appendChild( newName);
            newName.innerHTML =  'name : ' + nameOfP.value;
            newProcess.appendChild( newSize);
            newSize.innerHTML =  'size : ' + sizeOfP.value + ' MB';
        });
        newProcess.appendChild(title);
        newProcess.appendChild(nameInput);
        newProcess.appendChild(sizeInput);
        newProcess.appendChild(saveButton);
        this.currentProcessColumns.appendChild(newProcess);
        nameInput.classList.add('input');
        nameInput.attributes.type = 'text';
        nameInput.style.margin = '20px';
        nameInput.placeholder = 'name of process';
        nameInput.id = 'name'+this.processCounter;
        sizeInput.classList.add('input');
        sizeInput.attributes.type = 'text';
        sizeInput.style.margin = '20px';
        sizeInput.placeholder = 'size of process';
        sizeInput.id = 'size'+this.processCounter;
        this.processCounter++;

    };

    startCounting(i = 5 ) {
        // let func = this.startCounting;

            let interval = setInterval(function () {
                document.getElementById('my-counter').innerText = 'Starting in ' + i + ' Seconds ...';
                i--;
                if(i === 0){
                    clearInterval(interval);
                    document.getElementById('my-counter').innerText = 'Process Started ...';
                }
            }, 1000);



    }
    startJob = (i=0 , isEqual = true ) => {
        let editTable = this.editTable;
        let startJob = this.startJob;
        setTimeout(function () {
            let process = null;
            let result = null;
            try {
                process = Database.queues[0].dequeue();
                // console.log('running : ' + JSON.stringify(process));
                result = Database.memory.setProcess(process);
            }
            catch (e) {
                alert('finished');
                return;
            }
                if (result !== -1) {
                    // console.log('result is :' + result);
                    let l = Database.memory.processCount(result);
                    // console.log('database processes length are : ' + l);
                    if (result===0){l=0}
                    editTable(result+l, process , isEqual , process.size);
                    startJob(++i , isEqual );

                }

        },i===0 ? 6000 : 1000);
    };
    editTable = (i,p,isEqual = true , sum, isMultiple = false,queueIndex = 0) => {
        //we have process p and its index
        // console.log('index in edit table is : ' + i);
        let body = document.getElementById('memory-body');
        let memNode = body.childNodes;
        let prevNode = memNode[i - 1];
        let Node = memNode[i];
        let h = Node.clientHeight;
        body.removeChild(Node);
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        tr.appendChild(td);
        tr.style.height = (p.size / h).toString() + 'px';
        let tr2 = null;
        let td2 = null;
        if (Number(Node.innerText) - sum !== 0) {
            tr2 = document.createElement('tr');
            tr2.classList.add('is-selected');
            td2 = document.createElement('td');
            // console.log('inner Text :' + Node.childNodes[0].innerText);
            td2.innerHTML = isEqual ? (Number(this.equalPartition.value) - p.size).toString() : Number(Node.innerText) - sum;
            tr2.appendChild(td2);
        }
        td.innerHTML = '<p>' + p.size + ' MB</p>';
        if (prevNode !== undefined) {
            this.insertAfter(tr, prevNode);
            if (tr2 != null) this.insertAfter(tr2, tr);
        } else {
            if (tr2 != null) body.prepend(tr2);
            body.prepend(tr);
        }
        if (!isMultiple){
        //lets change the Queue
            let queue = document.getElementById('sq');
        let row = queue.childNodes[0].childNodes[0];
        row.removeChild(row.childNodes[1]);
    }
        else{
            let queue = document.getElementById('mq'+queueIndex);
            try {
                let row = queue.childNodes[0].childNodes[0];
                row.removeChild(row.childNodes[1]);
            }
            catch (e) {

            }
        }


    };
    startMultiJob = (ind=0)=>{
        let editTable = this.editTable;
        let startJob = this.startMultiJob;
        setTimeout(function () {
            let cond = false;
            for(let i = 0 ; i<Database.queues.length;i++) {
                let process = null;
                let result = null;
                try {
                    process = Database.queues[i].dequeue();
                    result = Database.memory.setProcess(process);
                } catch (e) {
                    alert('one queue finished');
                    continue;
                }
                cond = true;
                if (result !== -1) {
                    let l = Database.memory.processCount(result);
                    if (result === 0) {
                        l = 0
                    }
                    editTable(result + l, process, false, process.size , true , i);
                }
            }
        }, 6000 );
    };
    insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

};