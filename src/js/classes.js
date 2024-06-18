export class note {
    constructor() {
        this.sessionIndex = 0; // Number
        this.sessionName = '';
        this.sessionDate = new Date(); // Date object
        this.dungeonMaster = new player();
        this.dmCharacter = new playerCharacter();
        this.characters = new Array(); // Array of Character IDs
        this.players = new Array();
        this.gold = new Array(); // Complex object called a goldItem, consists of string label, number, and bool
        this.loot = new Array(); // Array of string
        this.highlights = new Array(); // Array of string
    }

    // Generate the discord markdown for copy and paste
    generateMarkdown() {
        let characterString = "";
        let goldString = "";
        let lootString = "";
        let highlightString = "";
        let goldTotal = 0;

        for (let i = 0; i < this.characters.length; i++) {
            if (i > 0) {characterString += '\n';}
            let player = this.players.find(p => p.getID() == this.characters[i].getPlayer());
            characterString += `- ${player.getName()}: *${this.characters[i].character}*`
        }
        for (let i = 0; i < this.gold.length; i++) {
            let gp = this.gold[i].amount;
            let isEach = this.gold[i].isEach;
            if (!isEach) {
                gp = Math.ceil(gp / this.characters.length);
            }
            if (i > 0) {goldString += '\n';}
            goldString += `- ${this.gold[i].label}: *${gp} GP each*`
            goldTotal += gp;
        }
        if (goldString == "") {
            goldString = "N/A";
        }
        else if (this.gold.length == 1) {
            // Do nothing because the math is already done
        }
        else {
            goldString += `\n__                                              __\n`;
            goldString += `**Total each:** ***${goldTotal} GP***`
        }
        
        for (let i = 0; i < this.loot.length; i++) {
            if (i > 0) {lootString += '\n';}
            lootString += `- ${this.loot[i]}`;
        }
        for (let i = 0; i < this.highlights.length; i++) {
            if (i > 0) {highlightString += '\n';}
            highlightString += `- ${this.highlights[i]}`
        }


        if (characterString == "") {
            characterString = "N/A";
        }
        
        if (lootString == "") {
            lootString = "N/A";
        }
        if (highlightString == "") {
            highlightString = "N/A";
        }

        return `## Session ${this.sessionIndex} - ${this.sessionName}
**Date** ${this.formatDateForInputField(this.sessionDate)}
**DM** ${this.dungeonMaster.getName()} (${this.dmCharacter.getCharacter()})
**PCs**
${characterString}

**Coin**
${goldString}

**Loot**
${lootString}

**Highlights**
${highlightString}`
    }
    setSessionIndex(index) {
        this.sessionIndex = index;
    }
    formatDateForInputField(date) {
        date = new Date(date);
        console.log(date);
        let offset = date.getTimezoneOffset();
        let minutes = date.getMinutes() + offset;
        date.setMinutes(minutes);
        console.log(date);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    getSessionIndex() {
        return this.sessionIndex;
    }

    setSessionName(input) {
        this.sessionName = input;
    }
    getSessionName() {
        return this.sessionName;
    }

    setSessionDate(date) {
        this.sessionDate = date;
    }
    getSessionDate() {
        return this.sessionDate;
    }

    setSessionDM(dm) {
        this.dungeonMaster = dm;
    }
    getSessionDM() {
        return this.dungeonMaster;
    }

    setDMCharacter(character) {
        this.dmCharacter = character;
    }
    getDMCharacter() {
        return this.dmCharacter;
    }

    // Add and remove characters from the object
    addCharacter(input) {
        this.characters.push(input);
    }
    delCharacter(index) {
        this.characters.splice(index, 1);
    }
    getCharacters() {
        return this.characters;
    }

    // Add and remove players from the object
    addPlayer(input) {
        this.players.push(input);
    }
    delPlayer(index) {
        this.players.splice(index, 1);
    }
    getPlayers() {
        return this.players;
    }

    // Add and remove highlights from the object
    addHighlight(input) {
        this.highlights.push(input);
    }
    delHighlight(index) {
        this.highlights.splice(index, 1);
    }
    getHighlights() {
        return this.highlights;
    }

    // Add and remove loot from the object
    addLoot(input) {
        this.loot.push(input);
    }
    delLoot(index) {
        this.loot.splice(index, 1);
    }
    getLoot() {
        return this.loot;
    }

    // Add and remove gold from the object
    addGold(label, amount, isEach) {
        let newGoldItem = new goldItem(label, amount, isEach);
        this.gold.push(newGoldItem);
    }
    delGold(index) {
        this.gold.splice(index, 1);
    }
    getGold() {
        return this.gold;
    }
   
    
}
export class player {
    constructor(name = "", ID = -1, created = new Date()) {
        this.ID = ID;
        this.name = name;
        this.created = created;
    }
    getID() {
        return this.ID;
    }
    setID(input) {
        this.ID = input;
    }
    getName() {
        return this.name;
    }
    setName(input) {
        this.name = input;
    }
    getCreated() {
        return this.created;
    }
    setCreated(input) {
        this.created = input;
    }
}

export class playerCharacter {
    constructor(player = -1, character = "", ID = -1, created = new Date()) {
        this.ID = ID;
        this.player = player; // This should technically be a number to do a lookup on a player list
        this.character = character;
        this.created = created;
    }
    getID() {
        return this.ID;
    }
    setID(input) {
        this.ID = input;
    }
    getPlayer() {
        return this.player;
    }
    getCharacter() {
        return this.character
    }
    setPlayer(input) {
        this.player = input;
    }
    setCharacter(input) {
        this.character = input;
    }
    getCreated() {
        return this.created;
    }
    setCreated(input) {
        this.created = input;
    }
}

export class goldItem {
    constructor(label, amount, isEach) {
        this.ID;
        this.label = label;
        this.amount = 0;
        // Type represents a boolean for what the amount is. 
        // The amount can either be the total gold a party receives before being split 
        // or after.
        this.isEach = false; 
    
        this.setAmount(amount);
        this.setIsEach(isEach);
    }
    getID() {
        return this.ID;
    }
    setID(input) {
        this.ID = input;
    }

    // Setter for label
    setLabel(value) {
        this.label = value;
    }
    getLabel() {
        return this.label;
    }

    // Setter for amount
    setAmount(value) {
        if (!isNaN(+value)) {
            this.amount = +value;
        }
    }
    getAmount() {
        return this.amount;
    }

    // Setter for isEach
    setIsEach(value) {
        if (typeof value == "boolean") {
            this.isEach = value;
        }
    }
    getIsEach() {
        return this.isEach;
    }

    // Return the information in the object
    display() {
        return {
            label: this.label,
            gold: this.gold,
            isEach: this.isEach
        }
    }
}