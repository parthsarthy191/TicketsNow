let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modelCont=document.querySelector(".model-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont1");
let allPriorityColors= document.querySelectorAll(".priority-colors");
let toolBoxColors = document.querySelectorAll(".color");


let colors = ["red", "orangered", "orange", "yellow", "greenyellow"];
let modelPriorityColor = colors[colors.length -1];

let addFlag= false;
let removeFlag= false;

let lockClass="fa-lock";
let unlockClass="fa-unlock";

let ticketArr= [];

if(localStorage.getItem("jira_tickets")){
    //retrieve and display tickets
    ticketArr=JSON.parse(localStorage.getItem("jira_tickets"));
    ticketArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}

for(let i=0;i< toolBoxColors.length;i++)
{
    toolBoxColors[i].addEventListener("click" , (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];
        
        let filteredTickets= ticketArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketColor;
        })
        //remove previous ticket
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for( let i=0;i<allTicketCont.length;i++)
        {
            allTicketCont[i].remove();
        }

        //display new filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })

    })

    toolBoxColors[i].addEventListener("dblclick", (e) =>{
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for( let i=0;i<allTicketCont.length;i++)
        {
            allTicketCont[i].remove();
        }

        ticketArr.forEach((ticketObj, idx) =>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })
}

//listener for mode priority coloring
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) =>{
        allPriorityColors.forEach((priorityColorElem, idx) =>{
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");

        modelPriorityColor=colorElem.classList[0];
    })
})

addBtn.addEventListener("click",(e)=>
{
    //create display model
    //generate ticket

    //addFlag, true -> Model display
    //addFlag, false -> model none
    addFlag =!addFlag;
    if(addFlag)
    {
        modelCont.style.display="flex";
    }
    else{
        modelCont.style.display="none";
    }
})

removeBtn.addEventListener("click" ,(e) =>{
    removeFlag =!removeFlag;
    console.log(removeFlag);
})

modelCont.addEventListener("keydown", (e) => {
    let key=e.key;
    if (key === "Shift"){
        createTicket(modelPriorityColor, textareaCont.value);
        setModelToDefault();
        addFlag = false;
    }
})

function createTicket(ticketColor, ticketTask, ticketID){
    let id=ticketID || shortid();
    let ticketCont=document.createElement("div");
    ticketCont.setAttribute("class","ticket-cont");
    ticketCont.innerHTML=`
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">
        ${ticketTask}
    </div>
    <div class="ticket-lock">
                <i class="fas fa-lock"></i>
            </div>
    `;
    mainCont.appendChild(ticketCont);

    //create object of ticket and add to array
    if(!ticketID){
        ticketArr.push({ticketColor, ticketTask, ticketID: id});
        localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));
    }
    

    handleRemoval(ticketCont,id);
    handleLock(ticketCont,id);
    handleColor(ticketCont,id);
}

function handleRemoval(ticket,id)
{
    //removeFlag -> true -> remove
    ticket.addEventListener("click", (e)=>{
        if(!removeFlag) return;


        let idx=getTicketIdx(id);

        //db removal
        ticketArr.splice(idx,1);
        let strTicketsArr =JSON.stringify(ticketArr);
        localStorage.setItem("jira_ticket",strTicketsArr);

        //Ui removal
        ticket.remove();
    })
    
}

function handleLock(ticket,id){
    let ticketLockElem =ticket.querySelector(".ticket-lock");
    let ticketLock=ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) =>{
        let ticketIdx=getTicketIdx(id);
        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable","true");

        }
        else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable","false"); 
        }

        //modify data in local storage (ticket task)
        ticketArr[ticketIdx].ticketTask= ticketTaskArea.innerText;
        localStorage.setItem("jira_ticket",JSON.stringify(ticketArr));

    })
}

function handleColor(ticket, id) {
    let ticketColor=ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) =>{
        //get ticket index from the tickets array
        let ticketIdx=getTicketIdx(id);
    let currentTicketColor =ticketColor.classList[1];
    //get ticket color index
    let currentTicketColorIdx = colors.findIndex((color) => {
        return currentTicketColor === color;

    })
    console.log(currentTicketColor, currentTicketColorIdx);
    currentTicketColorIdx++;
    let newTicketColorIdx = currentTicketColorIdx % colors.length;
    let newTicketColor = colors[newTicketColorIdx];
    ticketColor.classList.remove(currentTicketColor);
    ticketColor.classList.add(newTicketColor);

    //modify data in local storage (priority color change)
    ticketArr[ticketIdx].ticketColor = newTicketColor;
    localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    })
}

function getTicketIdx(id){
    let ticketIdx=ticketArr.findIndex((ticketObj)=> {
        return ticketObj.ticketID === id ;
    })
    return ticketIdx;

}

function setModelToDefault(){
    modelCont.style.display="none";
    textareaCont.value="";
    modelPriorityColor=colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem, idx) =>{
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors-1].classList.add("border");
}

