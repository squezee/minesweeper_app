const SIZE = 9;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
class Map{

    constructor(size){
        this.flags = 0;
        this.size = size;
        this.elements = [];
        for(let i = 0; i < size; i++){
            this.elements.push([]);
        }
    }
    #addElement(mapField){
        const i = mapField.id.split('-')[0];
        const j = mapField.id.split('-')[1];
        this.elements[i][j] = mapField;
    }
    #updateNumbers(){
        for(let i = 0; i<this.size; i++){
            for(let l = 0; l<this.size; l++){
                let bombsCounter = 0;
                const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
                for(let j = 0; j < directions.length; j++){
                    const foundableIndexI = i+directions[j][0];
                    const foundableIndexJ = l+directions[j][1];
                    if(foundableIndexI>=0&&
                        foundableIndexI<this.size&&
                        foundableIndexJ>=0&&
                        foundableIndexJ<this.size&&
                        this.elements[foundableIndexI][foundableIndexJ].hasBomb
                    ){
                        bombsCounter++;
                        
                    }
                }
                this.elements[i][l].number = bombsCounter;
                
            }
        }
    }
    lose(){
        for(let i = 0; i < this.size; i++){
        
            for(let j = 0; j < this.size; j++){
                if(this.elements[i][j].hasBomb){
                    this.elements[i][j].el.className = 'bomb gameItem checkedBlock small';
                }
            }
        }
        document.querySelector('.gameBox .shieldScreen').classList.add('active');
        document.querySelector('.gameControlPanel').innerHTML = 'LOSE';
        document.querySelector('.gameControlPanel').classList.add('lose');
    }
    win(){
        
        document.querySelector('.gameBox .shieldScreen').classList.add('active');
        document.querySelector('.gameControlPanel').innerHTML = 'WIN';
        document.querySelector('.gameControlPanel').classList.add('win');
    }
    createMap(){
        for(let i = 0; i < this.size; i++){
        
            for(let j = 0; j < this.size; j++){
                let mapField = new MapField(`${i}-${j}`);
                mapField.init();
                this.#addElement(mapField);
            }
        }
        this.#updateNumbers();
    }
}
var map = new Map(SIZE);
function showSiblings(field){
                const i = parseInt(field.id.split("-")[0]);
                const l = parseInt(field.id.split("-")[1]);
                const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
                for(let j = 0; j < directions.length; j++){
                    const foundableIndexI = i+directions[j][0];
                    const foundableIndexJ = l+directions[j][1];
                    
                    if(foundableIndexI>=0&&
                        foundableIndexI<map.size&&
                        foundableIndexJ>=0&&
                        foundableIndexJ<map.size&&
                        !map.elements[foundableIndexI][foundableIndexJ].visible
                    ){
                        
                        let foundableElement = map.elements[foundableIndexI][foundableIndexJ];
                        if(foundableElement.number==0){
                            foundableElement.visible = true;
                            foundableElement.el.classList.toggle('basicBlock');
                            foundableElement.el.classList.toggle('checkedBlock');
                            showSiblings(foundableElement);
                            
                            
                            
                        }else{
                            console.log("ApinG")
                            foundableElement.visible = true;
                            foundableElement.el.className = `gameItem checkedBlock small number number-${foundableElement.number}`;
                        }
                        
                    }
                }
}

class MapField{
    //id must be like "[i]-[j]"
    constructor(id) {
        this.id = id;
        this.el = null;
        
        this.visible = false;
        this.hasBomb = getRandomInt(100) < 10 ? true : false;
        this.hasFlag = false;
        this.number = 0;
    }
    init(){
        const i = this.id.split('-')[0];
        const j = this.id.split('-')[1];
        if(!document.querySelector(`#gameRow-${i}`)){
            let row = document.createElement("div");
            row.className = "gameRow";
            row.id = `gameRow-${i}`;
            row.innerHTML = "";
            for(let l = 0; l < SIZE; l++){
                row.innerHTML = row.innerHTML + `<div id="gameCol-${l}" class="gameCol"></div>`;
            }
            document.querySelector(".gameMap").append(row);
        }
        let fieldContainer = document.querySelector(`#gameRow-${i} #gameCol-${j}`);
        fieldContainer.innerHTML = `
            <div id="${i}-${j}" class="gameItem basicBlock small"></div>
        `;
        let field = fieldContainer.querySelector('.gameItem.basicBlock.small');
        this.el = field;
        field.addEventListener('contextmenu', function(ev) {
            ev.preventDefault();
            this.classList.toggle('flag');
            const i = this.id.split("-")[0];
            const j = this.id.split("-")[1];
            if(map.elements[i][j].hasFlag){
                map.elements[i][j].hasFlag = false;
                map.flags--;
            }else{
                map.elements[i][j].hasFlag = true;
                map.flags++;
            }
            let countOfBombs = 0;
            let countOfFlags = 0;
            let isOk = true;
            for(let i = 0; i < map.size; i++){
        
                for(let j = 0; j < map.size; j++){
                    const hasbomb = map.elements[i][j].hasBomb;
                    const hasflag = map.elements[i][j].hasFlag;
                    if(hasbomb){
                        countOfBombs++;
                    }
                    if(hasflag){
                        countOfFlags++;
                    }
                    if(hasbomb&&!hasflag||!hasbomb&&hasflag){
                        isOk = false;
                        break;
                    }

                }
            }
            console.log(`${countOfBombs} ; ${countOfFlags} ; ${isOk}`)
            if(countOfBombs==countOfFlags&&isOk){
                map.win();
            }
            return false;
        }, false);
        field.addEventListener('click', function handler(){
            const i = this.id.split("-")[0];
            const j = this.id.split("-")[1];
            let field = map.elements[i][j];
            
            if(field.hasBomb){
                map.lose();
            }else{
                field.visible = true;
                field.el.classList.toggle('basicBlock');
                field.el.classList.toggle('checkedBlock');
                if(field.number!=0){
                    field.el.className = `gameItem checkedBlock small number number-${field.number}`;
                }else{
                    showSiblings(field);
                }
            }
            this.removeEventListener('click', handler);
        });
        
    }
}


map.createMap();