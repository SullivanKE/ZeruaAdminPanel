import { note, goldItem, playerCharacter, player }  from '../classes.js';
import { repo } from '../repo';
import toastr from 'toastr';
import 'toastr/toastr.scss';


// IDs
/*
sidebar-add         Button to create new sessions
sidebar-list        Span to place new cards into containing sessions

head-index          index of session
head-name           name of session
head-date           date of session
head-dm             dm that ran
head-dmchar         dm's character

head-generate       button to generate markdown for discord
head-markdown       text area to display markdown
head-delete         delete the entire session


character-title     title text for characters
character-entry     input for adding characters
character-add       button to add inputted character
character-list      list of available characters


rewards-title       title text for rewards
rewards-each        button for determining the gold is calculated to give each character this much
rewards-total       button for determining the gold is calculated to be divided first by the number of characters
rewards-gold-entry  input for gold total
rewards-gold-add    button to add a gold item to the list
rewards-gold-list   list of gold entries

rewards-loot-entry  input for a loot entry
rewards-loot-add    button to add loot entry to list
rewards-loot-list   list of loot entries


highlights-title    title text for highlights
highlights-entry    input textarea for highlights
highlights-add      button to add highlights to list
highlights-list     list of highlights

*/

export class sessionNotes {
    constructor(repo) {
        this.repo = repo;

        // Current note that we are working on. Store the index only, 
        // work inside the array and save to local storage
        this.currentNote = 0; 
        this.remoteCurrentNote = 1;

        // List of all notes
        this.allNotes = this.fetchStorage(); 

        // For the gold button
        this.isEach = true;

        // What tab are we viewing
        this.remoteView = false;

        // Page Elements for the sidebar, adding new items and the full list
        this.$sidebarAdd = document.querySelector('#sidebar-add');
        this.$sidebarList = document.querySelector('#sidebar-list');
        this.$copy = document.querySelector('#copy-to-clipboard');
        this.$sidebarLocalTab = document.querySelector('#local-tab');

        // Page elements for the sidebar remote
        this.$remoteSideBarList = document.querySelector('#sessions-serverData');
        this.$sidebarRemoteTab = document.querySelector('#server-tab');
        this.$sidebarRemoteRefresh = document.querySelector('#sidebar-refresh');

        // Page elements for the Session Information area
        this.$headCollapse = document.querySelector('#header-input-section');
        this.$headIndex = document.querySelector('#head-index');
        this.$headName = document.querySelector('#head-name');
        this.$headDate = document.querySelector('#head-date');
        this.$headDM = document.querySelector('#head-dm');
        this.$headDMChar = document.querySelector('#head-dmchar');

        this.$headGenerate = document.querySelector('#head-generate');
        this.$headMarkdown = document.querySelector('#head-markdown');
        this.$headDelete = document.querySelector('#head-delete');
        this.$headGet = document.querySelector('#head-get');
        this.$headCommit = document.querySelector('#head-commit');
        this.$headGetSessionIndex = document.querySelector('#head-get-latest-index');

        // Page elements for the Characters area
        this.$characterCollapse = document.querySelector('#header-character-selection')
        this.$characterTitle = document.querySelector('#character-title');
        this.$characterPlayerEntry = document.querySelector('#character-player-entry')
        this.$characterEntry = document.querySelector('#character-entry');
        this.$characterAdd = document.querySelector('#character-add');
        this.$characterList = document.querySelector('#character-list');

        // Page elements for the Rewards area
        this.$rewardsCollapse = document.querySelector('#header-rewards-selection')
        this.$rewardsTitle = document.querySelector('#rewards-title');
        this.$rewardsEach = document.querySelector('#rewards-each');
        this.$rewardsTotal = document.querySelector('#rewards-total');
        this.$rewardsGoldLabel = document.querySelector('#rewards-gold-label');
        this.$rewardsGoldEntry = document.querySelector('#rewards-gold-entry');
        this.$rewardsGoldAdd = document.querySelector('#rewards-gold-add');
        this.$rewardsGoldList = document.querySelector('#rewards-gold-list');

        this.$rewardsLootEntry = document.querySelector('#rewards-loot-entry');
        this.$rewardsLootAdd = document.querySelector('#rewards-loot-add');
        this.$rewardsLootList = document.querySelector('#rewards-loot-list');

        // Page elements for the Highlights area
        this.$highlightsCollapse = document.querySelector('#header-highlights-selection')
        this.$hightlightsTitle = document.querySelector('#highlights-title');
        this.$highlightsEntry = document.querySelector('#highlights-entry');
        this.$highlightsAdd = document.querySelector('#highlights-add');
        this.$highlightsList = document.querySelector('#highlights-list');

        // Binds
        this.changeHeader = this.changeHeader.bind(this);
        this.addNote = this.addNote.bind(this);
        this.updateDisplay = this.updateDisplay.bind(this);
        this.updateDisplaySidebar = this.updateDisplaySidebar.bind(this);
        this.updateDisplayCharacter = this.updateDisplayCharacter.bind(this);
        this.updateDisplayLoot = this.updateDisplayLoot.bind(this);
        this.updateDisplayHighlights = this.updateDisplayHighlights.bind(this);

        this.updateDisplaySidebarRemote = this.updateDisplaySidebarRemote.bind(this);
        this.updateDisplayCharacterRemote = this.updateDisplayCharacterRemote.bind(this);
        this.updateDisplayLootRemote = this.updateDisplayLootRemote.bind(this);
        this.updateDisplayHighlightsRemote = this.updateDisplayHighlightsRemote.bind(this);
        
        this.swapIsEachGold = this.swapIsEachGold.bind(this);

        this.addCharacter = this.addCharacter.bind(this);
        this.addGold = this.addGold.bind(this);
        this.addLoot = this.addLoot.bind(this);
        this.addHighlight = this.addHighlight.bind(this);

        this.characterKeyListener = this.characterKeyListener.bind(this);
        this.lootKeyListener = this.lootKeyListener.bind(this);
        this.goldKeyListener = this.goldKeyListener.bind(this);
        this.highlightKeyListener = this.highlightKeyListener.bind(this);

        this.delCharacter = this.delCharacter.bind(this);

        this.generateMarkdownInHeading = this.generateMarkdownInHeading.bind(this);
        this.delSessionInHeading = this.delSessionInHeading.bind(this);

        this.localViewing = this.localViewing.bind(this);
        this.removeViewing = this.remoteViewing.bind(this);
        this.forceSessionRefresh = this.forceSessionRefresh.bind(this);

        this.populateDMPlayers = this.populateDMPlayers.bind(this);
        this.populatePlayers = this.populatePlayers.bind(this);

        this.populateCharacters = this.populateCharacters.bind(this);
        this.populateDMCharacters = this.populateDMCharacters.bind(this);
        
        this.selectDM = this.selectDM.bind(this);
        this.selectDMChar = this.selectDMChar.bind(this);

        this.setCurrentIndex = this.setCurrentIndex.bind(this);
        this.commitSession = this.commitSession.bind(this);
        this.getSessionRemoteHead = this.getSessionRemoteHead.bind(this);

        // Event listeners for static elements
        this.$sidebarAdd.addEventListener("click", this.addNote);
        this.$sidebarLocalTab.addEventListener("click", this.localViewing);
        this.$sidebarRemoteTab.addEventListener("click", this.removeViewing);
        this.$sidebarRemoteRefresh.addEventListener("click", this.forceSessionRefresh);

        this.$headIndex.addEventListener("change", this.changeHeader);
        this.$headName.addEventListener("change", this.changeHeader);
        this.$headDate.addEventListener("change", this.changeHeader);
        this.$headDM.addEventListener("change", this.selectDM);
        this.$headDMChar.addEventListener("change", this.selectDMChar);
        this.$headGetSessionIndex.addEventListener("click", this.setCurrentIndex);
        this.$headCommit.addEventListener("click", this.commitSession);

        this.$characterAdd.addEventListener("click", this.addCharacter);

        this.$rewardsGoldAdd.addEventListener("click", this.addGold);
        this.$rewardsLootAdd.addEventListener("click", this.addLoot);

        this.$highlightsAdd.addEventListener("click", this.addHighlight);

        this.$rewardsEach.addEventListener("click", this.swapIsEachGold);
        this.$rewardsTotal.addEventListener("click", this.swapIsEachGold);

        this.$characterEntry.addEventListener("keyup", this.characterKeyListener);
        this.$characterPlayerEntry.addEventListener("keyup", this.characterKeyListener);

        this.$rewardsGoldEntry.addEventListener("keyup", this.goldKeyListener);
        this.$rewardsGoldLabel.addEventListener("keyup", this.goldKeyListener);

        this.$rewardsLootEntry.addEventListener("keyup", this.lootKeyListener);

        this.$highlightsEntry.addEventListener("keyup", this.highlightKeyListener);

        this.$headDelete.addEventListener("click", this.delSessionInHeading);
        this.$headGenerate.addEventListener("click", this.generateMarkdownInHeading)

        this.$characterPlayerEntry.addEventListener("change", this.populateCharacters);

        this.$headGet.addEventListener("click", this.getSessionRemoteHead);
        

        this.$headMarkdown.addEventListener("click", () => {
            navigator.clipboard.writeText(this.$headMarkdown.value);
            toastr.success("Copied note to clipboard");
            if (this.$headMarkdown.value.length > 4000) {
                toastr.warning("Note is over the nitro post limit.");
            }
            else if (this.$headMarkdown.value.length > 2000) {
                toastr.warning("Note is over free discord limit.");
            }})


        
        this.updateDisplay();

        //this.populatePlayers();
        //this.populateDMPlayers();

        

    }
    setCurrentIndex() {
        let index = this.repo.getLatestIndex() + 1;
        this.$headIndex.value = index;
        this.allNotes[this.currentNote].setSessionIndex(index);
        this.updateStorage();
    }
    async commitSession() {
        let note = this.allNotes[this.currentNote];
        await this.repo.insertSession(note);
        this.repo.commitSession(note);
    }
    async forceSessionRefresh() {
        await this.repo.refreshSessions(true);
        this.remoteCurrentNote = await this.repo.getPlayers().length - 1;
        this.populatePlayers();
        await this.updateDisplay();
    }

    async populateDMPlayers() {

        let players = await this.repo.getPlayers();
        
        let select = `<option value="-1" hidden>Please select a player</option>`;
        players.forEach((p) => {
            select += `<option value="${p.getID()}">${p.getName()}</option>`;
        });
        
        let notes = await this.repo.getSessions();
        let n = new note();
        n.getSessionDM(new player());

        if (this.remoteView) {
            if (this.remoteCurrentNote > 0 && notes.length > 0) {
                n = notes[this.remoteCurrentNote];
                this.$headDM.innerHTML = select;
                this.$headDM.value = n.getSessionDM().getID();
            }
        }
        else {
            if (this.allNotes.length > 0) {
                n = this.allNotes[this.currentNote];
                this.$headDM.innerHTML = select;
                this.$headDM.value = n.getSessionDM().getID();
            }
        }

        await this.populateDMCharacters();
        
    }
    async populatePlayers() {
        let players = await this.repo.getPlayers();

        let select = `<option value="-1" hidden>Please select a player</option>`;
        players.forEach((p) => {
            select += `<option value="${p.getID()}">${p.getName()}</option>`;
        })
        this.$characterPlayerEntry.innerHTML = select;
    }
    async populateDMCharacters() {
        let n = new note();
        let notes = await this.repo.getSessions();
        let id = -1;

        if (this.remoteView) {
            if (this.remoteCurrentNote > 0 && notes.length > 0) {
                n = this.repo.getSessions()[this.remoteCurrentNote];
                id = n.getSessionDM().getID();
            }              
        }
        else {
            if (this.allNotes.length > 0) {
                n = this.allNotes[this.currentNote];
                id = n.getSessionDM().getID();
            }      
        }


        

        let characters = this.repo.getCharacters(id);

        let select = `<option value="-1" hidden>Please select a character</option>`;
        characters.forEach((c) => {
            select += `<option value="${c.getID()}">${c.getCharacter()}</option>`;
        })
        this.$headDMChar.innerHTML = select;
        this.$headDMChar.value = n.getDMCharacter().getID();
    }
    populateCharacters() {
        let option = this.$characterPlayerEntry.options[this.$characterPlayerEntry.selectedIndex];
        let id = option.value;
        let characters = this.repo.getCharacters();
        let select = `<option value="-1" hidden>Please select a character</option>`;
        characters.forEach((c) => {
            if (c.getPlayer() == id)
                select += `<option value="${c.getID()}">${c.getCharacter()}</option>`;
        })
        this.$characterEntry.innerHTML = select;
    }

    disableControls() {
        this.$headIndex.disabled = true;
        this.$headName.disabled = true;
        this.$headDate.disabled = true;
        this.$headDM.disabled = true;
        this.$headDMChar.disabled = true;

        this.$characterAdd.disabled = true;
        this.$characterEntry.disabled = true;
        this.$characterPlayerEntry.disabled = true;

        this.$rewardsGoldEntry.disabled = true;
        this.$rewardsGoldAdd.disabled = true;
        this.$rewardsGoldLabel.disabled = true;

        this.$rewardsLootAdd.disabled = true;
        this.$rewardsLootEntry.disabled = true;

        this.$rewardsEach.disabled = true;
        this.$rewardsTotal.disabled = true;

        this.$highlightsAdd.disabled = true;
        this.$highlightsEntry.disabled = true;
    }
    enableControls() {
        this.$headIndex.disabled = false;
        this.$headName.disabled = false;
        this.$headDate.disabled = false;
        this.$headDM.disabled = false;
        this.$headDMChar.disabled = false;

        this.$characterAdd.disabled = false;
        this.$characterEntry.disabled = false;
        this.$characterPlayerEntry.disabled = false;

        this.$rewardsGoldEntry.disabled = false;
        this.$rewardsGoldAdd.disabled = false;
        this.$rewardsGoldLabel.disabled = false;

        this.$rewardsEach.disabled = false;
        this.$rewardsTotal.disabled = false;

        this.$rewardsLootAdd.disabled = false;
        this.$rewardsLootEntry.disabled = false;

        this.$highlightsAdd.disabled = false;
        this.$highlightsEntry.disabled = false;
    }

    async remoteViewing() {
        this.remoteView = true;
        if (this.repo.getSessions().length > 0) {
            this.remoteCurrentNote = this.repo.getSessions().length - 1;
        }

        // Disable all inputs
        this.disableControls();

        this.$headCommit.hidden = true;
        this.$headGet.hidden = false;
        await this.updateDisplay();
    }
    async localViewing() {
        this.remoteView = false;

        // Enable all inputs
        this.enableControls();

        this.$headCommit.hidden = false;
        this.$headGet.hidden = true;
        await this.updateDisplay();
    }

    characterKeyListener(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            this.addCharacter();
        }
    }
    lootKeyListener(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            this.addLoot();
        }
    }
    goldKeyListener(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            this.addGold();
        }
    }
    highlightKeyListener(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            this.addHighlight();
        }
    }
    async selectDM() {
        if (this.allNotes.length > 0) {
            let player = await this.repo.getPlayers(this.$headDM.value);
            this.allNotes[this.currentNote].setSessionDM(player[0]);
            this.updateStorage();
            await this.populateDMCharacters();
        }
    }
    async selectDMChar() {
        if (this.allNotes.length > 0) {
            let characters = this.repo.getCharacters();
            let character = characters.find(c => c.getID() == this.$headDMChar.value);
            this.allNotes[this.currentNote].setDMCharacter(character);
            this.updateStorage();
        }
    }

    async changeHeader() {
        if (this.allNotes.length > 0) {
            let note = this.allNotes[this.currentNote];

            note.setSessionIndex(this.$headIndex.value);
            note.setSessionName(this.$headName.value);
            note.setSessionDate(new Date(this.$headDate.value));
    
            this.allNotes[this.currentNote] = note;
    
            this.updateStorage();
            this.populateDMPlayers();
            await this.populateDMCharacters();
        }
        else {
            toastr.error("There are no sessions to edit.");
        }
        
    }

    async addCharacter() {
        if (this.allNotes.length > 0) {
            let note = this.allNotes[this.currentNote];
            let characters = this.repo.getCharacters();
            let c = characters.find(c => c.getID() == this.$characterEntry.value);
            note.addCharacter(c);

            let players = await this.repo.getPlayers();
            let p = players.find(p => p.getID() == this.$characterPlayerEntry.value);
            note.addPlayer(p);

            this.allNotes[this.currentNote] = note;


            this.populateCharacters();
            this.$characterEntry.innerHTML = '<optionvalue = "-1">Select a player first</option>';

            this.updateStorage();
        }
        else {
            toastr.error("There are no sessions to edit.");
        }
        
    }
    swapIsEachGold() {
        this.isEach = !this.isEach;
        this.$rewardsTotal.hidden = this.isEach;
        this.$rewardsEach.hidden = !this.isEach;
    }
    addGold() {
        if (this.allNotes.length > 0) {
            let note = this.allNotes[this.currentNote];
            note.addGold(this.$rewardsGoldLabel.value, this.$rewardsGoldEntry.value, this.isEach);
            this.allNotes[this.currentNote] = note;

            this.$rewardsGoldLabel.value='';
            this.$rewardsGoldLabel.focus();
            this.$rewardsGoldEntry.value='';
    
            this.updateStorage();
        }
        else {
            toastr.error("There are no sessions to edit.");
        }
        
    }
    addLoot() {
        if (this.allNotes.length > 0) {
            let note = this.allNotes[this.currentNote];
            note.addLoot(this.$rewardsLootEntry.value);
            this.allNotes[this.currentNote] = note;

            this.$rewardsLootEntry.focus();
            this.$rewardsLootEntry.value='';
    
            this.updateStorage();
        }
        else {
            toastr.error("There are no sessions to edit.");
        }
        
    }
    addHighlight() {
        if (this.allNotes.length > 0) {
            let note = this.allNotes[this.currentNote];
            note.addHighlight(this.$highlightsEntry.value);
            this.allNotes[this.currentNote] = note;

            this.$highlightsEntry.value='';
            this.$highlightsEntry.focus();
    
            this.updateStorage();
        }
        else {
            toastr.error("There are no sessions to edit.");
        }
        
    }

    async viewNote(index) {
        this.currentNote = index;
        await this.updateDisplay();
    }

    async updateStorage() {
        localStorage["allNotes"] = JSON.stringify(this.allNotes);
        await this.updateDisplay();
    }

    fetchStorage() {
        let notes = new Array();
        try {
            notes = JSON.parse(localStorage["allNotes"]); 
            this.currentNote = notes.length - 1;
            
        }
        catch {
            notes = new Array();
        }

        for (let i = 0; i < notes.length; i++) {
            notes[i] = Object.assign(new note, notes[i]);
            notes[i].setDMCharacter(Object.assign(new playerCharacter, notes[i].getDMCharacter()));
            notes[i].setSessionDM(Object.assign(new player, notes[i].getSessionDM()));
                
            let characters = new Array();
            notes[i].getCharacters().forEach((c) => {
                let character = Object.assign(new playerCharacter, c);
                characters.push(character);
            });
            notes[i].characters = characters;

            let players = new Array();
            notes[i].getPlayers().forEach((p) => {
                let pl = Object.assign(new player, p);
                players.push(pl);
            });
            notes[i].players = players;

            let gold = new Array();
            notes[i].getGold().forEach((g) => {
                let gi = Object.assign(new goldItem, g);
                gold.push(gi);
            });
            notes[i].gold = gold;
        }

        return notes;
    }

    async addNote() {
        this.allNotes.push(new note());
        this.currentNote = this.allNotes.length - 1; // Set the note to the new note

        this.$headIndex.focus();

        this.setCurrentIndex();

        
        this.populateCharacters();
        await this.populateDMCharacters();
    }

    async updateDisplay() {
        if (this.remoteView) {

            
            // Update sidebar
            this.updateDisplaySidebarRemote();
            this.addSiderbarEventHandlersRemote();

            // Update header section
            this.updateDisplayHeaderRemote();

            // Update character section
            await this.updateDisplayCharacterRemote();

            // Update loot section
            this.updateDisplayLootRemote();

            // Update highlights section
            this.updateDisplayHighlightsRemote();

            this.disableControls();

        }
        else {
            this.enableControls();
            // Update sidebar
            this.updateDisplaySidebar();
            this.addSiderbarEventHandlers();

            // Update header section
            this.updateDisplayHeader();

            // Update character section
            await this.updateDisplayCharacter();
            this.addCharacterEventHandlers();

            // Update loot section
            this.updateDisplayLoot();
            this.addLootEventHandlers();
            this.addGoldEventHandlers();

            // Update highlights section
            this.updateDisplayHighlights();
            this.addHighlightsEventHandlers();
        }
            

        this.populatePlayers();
        this.populateDMPlayers();

    }

    updateDisplaySidebar() {
        let cards = "";
        for(let i = this.allNotes.length - 1; i >= 0; i--) {
            cards += this.buildSidebarCard(i);
        }
        this.$sidebarList.innerHTML = cards;

    }
    updateDisplaySidebarRemote() {
        let cards = "";
        if (this.repo.getSessions().length > 0) {
            let notes = this.repo.getSessions();
            for(let i = notes.length - 1; i >= 1; i--) {
                cards += this.buildSidebarCardRemote(i);
            }
        }
        else
            cards = "Please wait for remote information to populate...";
        
        this.$remoteSideBarList.innerHTML = cards;

    }

    addSiderbarEventHandlers() {
        let openButtons = document.getElementsByName("sidebar-open");
        //let copyButtons = document.getElementsByName("sidebar-copy");
        //let delButtons = document.getElementsByName("sidebar-delete");

        // All lengths should be the same
        for (let i = 0; i < openButtons.length; i++) {
            let openButton = document.querySelector(`#sidebar-${i}-open`);
            let copyButton = document.querySelector(`#sidebar-${i}-copy`);
            let delButton = document.querySelector(`#sidebar-${i}-delete`);
            let session = document.querySelector(`#sidebar-${i}`)

            openButton.onclick = this.selectSession.bind(this, i);
            copyButton.onclick = this.clipboardSession.bind(this, i);
            delButton.onclick = this.delSession.bind(this, i);
            session.ondblclick = this.selectSession.bind(this, i);

        }
    }
    addSiderbarEventHandlersRemote() {
        let openButtons = document.getElementsByName("sidebar-remote-open");
        //let copyButtons = document.getElementsByName("sidebar-copy");
        //let delButtons = document.getElementsByName("sidebar-delete");

        // We start at full length because remote sessions do not start at 0.
        for (let i = openButtons.length; i > 0 ; i--) {
            let openButton = document.querySelector(`#sidebar-remote-${i}-open`);
            let copyButton = document.querySelector(`#sidebar-remote-${i}-copy`);
            let getButton = document.querySelector(`#sidebar-remote-${i}-get`);
            let session = document.querySelector(`#sidebar-remote-${i}`)

            openButton.onclick = this.selectSessionRemote.bind(this, i);
            copyButton.onclick = this.clipboardSession.bind(this, i);
            getButton.onclick = this.getSessionRemote.bind(this, i);
            session.ondblclick = this.selectSessionRemote.bind(this, i);

        }
    }
    delSession(index) {
        let delCheck = prompt("Type 'DELETE' to delete the session");
        if (delCheck === "DELETE") {
            this.allNotes.splice(index, 1);
            if (this.currentNote == index || this.currentNote >= this.allNotes.length) {
                this.currentNote = this.allNotes.length - 1;
            }
            toastr.success("Session deleted.");
            this.updateStorage();
        }
    }
    async selectSession(index) {
        this.currentNote = index;
        // Update header section
        await this.updateDisplay();
    }
    clipboardSession(index) {
        let note;
        if (this.remoteView) {
            note = this.repo.getSessions()[this.remoteCurrentNote];
        }
        else {
            note = this.allNotes[index];
        }
        
        let copy = note.generateMarkdown();
        //this.$copy.value = note.generateMarkdown();
        navigator.clipboard.writeText(copy);
        toastr.success("Copied note to clipboard");
        if (copy.length > 4000) {
            toastr.warning("Note is over the nitro post limit.");
        }
        else if (copy.length > 2000) {
            toastr.warning("Note is over free discord limit.");
        }
    }
    async selectSessionRemote(index) {
        this.remoteCurrentNote = index;
        // Update header section
        await this.updateDisplay();
    }
    getSessionRemote(index) {
        this.allNotes.push(this.repo.getSessions()[index])
        this.updateStorage();
        toastr.success("Session copied to local drafts.")
    }
    getSessionRemoteHead() {
        this.allNotes.push(this.repo.getSessions()[this.remoteCurrentNote])
        this.updateStorage();
        toastr.success("Session copied to local drafts.")
    }
    generateMarkdownInHeading() {
        let note;
        if (this.remoteView) {
            note = this.repo.getSessions()[this.remoteCurrentNote];
        }
        else {
            note = this.allNotes[index];
        }

        let copy = note.generateMarkdown();
        this.$headMarkdown.value = copy;
        navigator.clipboard.writeText(copy);
        toastr.success("Copied note to clipboard");
        if (copy.length > 4000) {
            toastr.warning("Note is over the nitro post limit.");
        }
        else if (copy.length > 2000) {
            toastr.warning("Note is over free discord limit.");
        }
    }
    async delSessionInHeading() {
        if (this.remoteView) {
            await this.repo.deleteSession(this.remoteCurrentNote);
            this.remoteCurrentNote = await this.repo.getSessions().length - 1;
            await this.updateDisplay();
        }  
        else {
            let delCheck = prompt("Type 'DELETE' to delete the session");
            if (delCheck === "DELETE") {
                let index = this.currentNote;
                this.allNotes.splice(index, 1);
                if (this.currentNote == index || this.currentNote >= this.allNotes.length) {
                    this.currentNote = this.allNotes.length - 1;
                }
                toastr.success("Session deleted.");
                await this.updateStorage();
            }
        }
            
        
    }
    formatDateForInputField(date) {
        date = new Date(date);
        let offset = date.getTimezoneOffset();
        let minutes = date.getMinutes() + offset;
        date.setMinutes(minutes);
        return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    }

    updateDisplayHeader() {
        
        if (this.allNotes.length > 0) {
            this.$headIndex.value = parseInt(this.allNotes[this.currentNote].getSessionIndex());
            this.$headName.value = this.allNotes[this.currentNote].getSessionName();
            this.$headDate.value = this.formatDateForInputField(this.allNotes[this.currentNote].getSessionDate());

            this.$headGenerate.disabled = false;
            this.$headDelete.disabled = false;
            this.$headMarkdown.disabled = false;
        }
        else {
            this.$headIndex.value = 0;
            this.$headName.value = "";
            this.$headDate.value = this.formatDateForInputField(new Date());

            this.$headGenerate.disabled = true;
            this.$headDelete.disabled = true;
            this.$headMarkdown.disabled = true;
        }
        


        this.$headMarkdown.value = "";
    }
    updateDisplayHeaderRemote() {
        let note = this.repo.getSessions();
        
        if (note.length > 0 && this.remoteCurrentNote > 0) {
            this.$headIndex.value = parseInt(note[this.remoteCurrentNote].getSessionIndex());
            this.$headName.value = note[this.remoteCurrentNote].getSessionName();
            this.$headDate.value = this.formatDateForInputField(note[this.remoteCurrentNote].getSessionDate());

            this.$headGenerate.disabled = false;
            this.$headDelete.disabled = false;
            this.$headMarkdown.disabled = false;
        }
        else {
            this.$headIndex.value = 0;
            this.$headName.value = "";
            this.$headDate.value = this.formatDateForInputField(new Date());
            this.$headDM.value = "";
            this.$headDMChar.value = ""; 

            this.$headGenerate.disabled = true;
            this.$headDelete.disabled = true;
            this.$headMarkdown.disabled = true;
        }
        


        this.$headMarkdown.value = "";
    }

    async updateDisplayCharacter() {
        let characters;
        let players;
        let characterHTML = "";
        let title = 'Characters';

        if (this.allNotes.length > 0) {
            let note = this.allNotes[this.currentNote];
            characters = note.getCharacters();
            players = note.getPlayers();
            
            if (characters.length > 0) {
                title += ` (${characters.length})`
            }

            for (let i = 0; i < characters.length; i++) {
                let p = players.find(p => p.getID() == characters[i].getPlayer());
                let data = {
                    ch: characters[i],
                    pl: p
                }
                characterHTML += await this.buildCharacterRow(i, data);
            }
        }
        else {
            characters = "";
        }

        this.$characterTitle.innerHTML = title;
        this.$characterList.innerHTML = characterHTML;
    }
    async updateDisplayCharacterRemote() {
        let note = this.repo.getSessions();

        let characters;
        let players;
        let characterHTML = "";
        let title = 'Characters';

        if (note.length > 0 && this.remoteCurrentNote > 0) {
            characters = note[this.remoteCurrentNote].getCharacters();
            players = note[this.remoteCurrentNote].getPlayers();
            
            if (characters.length > 0) {
                title += ` (${characters.length})`
            }

            for (let i = 0; i < characters.length; i++) {
                let p = players.find(p => p.getID() == characters[i].getPlayer());
                let data = {
                    ch: characters[i],
                    pl: p
                }
                characterHTML += await this.buildCharacterRowRemote(i, data);
            }
        }
        else {
            characters = "";
        }

        this.$characterTitle.innerHTML = title;
        this.$characterList.innerHTML = characterHTML;
    }
    addCharacterEventHandlers() {
        let characterRows = document.getElementsByName("character-row");
        for (let i = 0; i < characterRows.length; i++) {
            let deleteButton = document.querySelector(`#character-${i}-delete`);
            deleteButton.onclick = this.delCharacter.bind(this, i);
        }
    }
    delCharacter(index) {
        let note = this.allNotes[this.currentNote];
        note.delCharacter(index)
        this.allNotes[this.currentNote] = note;
        this.updateStorage();
    }
    async buildCharacterRow(index, data) {
        let character = data.ch;
        let player = data.pl;
        return `<tr name="character-row" data-index="${index}"><td class="text-break">${player.getName()}</td><td class="text-break">${character.getCharacter()}</td><td><button class="btn btn-danger btn-sm w-100" id="character-${index}-delete" data-index="${index}">Remove</button></td></tr>`;
    }

    async buildCharacterRowRemote(index, data) {
        let character = data.ch;
        let player = data.pl;
        return `<tr name="character-row" data-index="${index}"><td class="text-break">${player.getName()}</td><td class="text-break">${character.getCharacter()}</td></tr>`;
    }

    updateDisplayLoot() {

        let goldHTML = "";
        let lootHTML = "";

        let title = 'Loot';

        if (this.allNotes.length > 0) {
            let loot = this.allNotes[this.currentNote].getLoot();
            let gold = this.allNotes[this.currentNote].getGold();
            let playerCount = this.allNotes[this.currentNote].getCharacters().length;

            
            if (gold.length + loot.length > 0) {
                title += ` (${gold.length + loot.length})`
            }
            
            for (let i = 0; i < gold.length; i++) {
                let newGold = new goldItem(gold[i].label, gold[i].amount, gold[i].isEach);
                goldHTML += this.buildGoldRow(i, newGold, playerCount);
            }
            
            
            for (let i = 0; i < loot.length; i++) {
                lootHTML += this.buildLootRow(i, loot[i]);
            }
        }


        this.$rewardsTitle.innerHTML = title;
        this.$rewardsGoldList.innerHTML = goldHTML;
        this.$rewardsLootList.innerHTML = lootHTML;


    }
    updateDisplayLootRemote() {

        let note = this.repo.getSessions();

        let goldHTML = "";
        let lootHTML = "";

        let title = 'Loot';

        if (note.length > 0 && this.remoteCurrentNote > 0) {
            let loot = note[this.remoteCurrentNote].getLoot();
            let gold = note[this.remoteCurrentNote].getGold();
            let playerCount = note[this.remoteCurrentNote].getCharacters().length;

            
            if (gold.length + loot.length > 0) {
                title += ` (${gold.length + loot.length})`
            }
            
            for (let i = 0; i < gold.length; i++) {
                let newGold = new goldItem(gold[i].label, gold[i].amount, gold[i].isEach);
                goldHTML += this.buildGoldRowRemote(i, newGold, playerCount);
            }
            
            
            for (let i = 0; i < loot.length; i++) {
                lootHTML += this.buildLootRowRemote(i, loot[i]);
            }
        }


        this.$rewardsTitle.innerHTML = title;
        this.$rewardsGoldList.innerHTML = goldHTML;
        this.$rewardsLootList.innerHTML = lootHTML;


    }
    buildGoldRow(index, gold, playerCount) {      
            let result = `<tr name="gold-row"><td class="text-break">${gold.getLabel()}</td><td>`;
            let each = '';
            if (gold.getIsEach()) {
                result += `${gold.getAmount()} GP</td>`;
                each = 'Each';
            }
            else {
                result += `${Math.ceil(gold.getAmount() / playerCount)} GP</td>`;
                each = 'Split';
            }
            result += `<td>${each}</td><td><button class="btn btn-danger btn-sm w-100" id="gold-${index}-delete" name="gold-del-button" data-index=${index}>Remove</button></td></tr>`;
            
            
        
        return result;
    }
    buildGoldRowRemote(index, gold, playerCount) {      
        let result = `<tr name="gold-row"><td class="text-break">${gold.getLabel()}</td><td>`;
        let each = '';
        if (gold.getIsEach()) {
            result += `${gold.getAmount()} GP</td>`;
            each = 'Each';
        }
        else {
            result += `${Math.ceil(gold.getAmount() / playerCount)} GP</td>`;
            each = 'Split';
        }
        result += `<td>${each}</td></tr>`;
        
        
    
    return result;
}
    addGoldEventHandlers() {
        let goldItems = document.getElementsByName("gold-del-button");
        for (let i = 0; i < goldItems.length; i++) {
            let delButton = document.querySelector(`#gold-${i}-delete`);
            delButton.onclick = this.delGold.bind(this, i);
        }
    }
    delGold(index) {
        let note = this.allNotes[this.currentNote];
        note.delGold(index)
        this.allNotes[this.currentNote] = note;
        this.updateStorage();
    }
    buildLootRow(index, loot) {
        return `<tr name="loot-row"><td class="text-break">${loot}</td><td><button class="btn btn-danger btn-sm w-100" id="loot-${index}-delete" name="loot-del-button">Remove</button></td></tr>`;
    }
    buildLootRowRemote(index, loot) {
        return `<tr name="loot-row"><td class="text-break">${loot}</td></tr>`;
    }
    addLootEventHandlers() {
        let lootItems = document.getElementsByName("loot-del-button");
        for (let i = 0; i < lootItems.length; i++) {
            let delButton = document.querySelector(`#loot-${i}-delete`);
            delButton.onclick = this.delLoot.bind(this, i);
        }
    }
    delLoot(index) {
        let note = this.allNotes[this.currentNote];
        note.delLoot(index)
        this.allNotes[this.currentNote] = note;
        this.updateStorage();
    }

    updateDisplayHighlights() {

        let title = 'Highlights';
        let hightlightHTML = "";

        if (this.allNotes.length > 0) {
            let highlights = this.allNotes[this.currentNote].getHighlights()
            
            if (highlights.length > 0) {
                title += ` (${highlights.length})`
            }
            
            for (let i = 0; i < highlights.length; i++) {
                hightlightHTML += this.buildHighlightRow(i, highlights[i]);
            }
        }


        this.$hightlightsTitle.innerHTML = title;
        this.$highlightsList.innerHTML = hightlightHTML; 
    }
    updateDisplayHighlightsRemote() {

        let note = this.repo.getSessions();

        let title = 'Highlights';
        let hightlightHTML = "";

        if (note.length > 0) {
            let highlights = note[this.remoteCurrentNote].getHighlights()
            
            if (highlights.length > 0) {
                title += ` (${highlights.length})`
            }
            
            for (let i = 0; i < highlights.length; i++) {
                hightlightHTML += this.buildHighlightRowRemote(i, highlights[i]);
            }
        }


        this.$hightlightsTitle.innerHTML = title;
        this.$highlightsList.innerHTML = hightlightHTML; 
    }
    addHighlightsEventHandlers() {
        let highlights = document.getElementsByName("highlight-del-button");
        for (let i = 0; i < highlights.length; i++) {
            let delButton = document.querySelector(`#highlight-${i}-delete`);
            delButton.onclick = this.delHighlight.bind(this, i);
        }
    }
    delHighlight(index) {
        let note = this.allNotes[this.currentNote];
        note.delHighlight(index)
        this.allNotes[this.currentNote] = note;
        this.updateStorage();
    }
    buildHighlightRow(index, highlight) {
        return `<tr name="highlight-row"><td class="text-break">${highlight}</td><td><button class="btn btn-danger btn-sm w-100" name="highlight-del-button" id="highlight-${index}-delete">Remove</button></td></tr>`;
    }
    buildHighlightRowRemote(index, highlight) {
        return `<tr name="highlight-row"><td class="text-break">${highlight}</td></tr>`;
    }
    buildSidebarCard(index) {
        
        // Get the note from the index provided
        let note = this.allNotes[index];
        let characters = note.getCharacters();
        let players = note.getPlayers();
        let characterTable = "";
        for (let i = 0; i < characters.length; i++) {
            let p = players.find(p => p.getID() == characters[i].getPlayer());
            characterTable += `<tr><td>${p.getName()}</td><td>${characters[i].getCharacter()}</td></tr>`
        }

        let buttonColor = 'primary';
        let borderColor = 'dark';
        let active = "";
        let expanded = "";
        if (this.currentNote == index) {
            // This note is currently selected and gets special markdown
            buttonColor = 'warning';
            borderColor = 'warning';
            active = "show";
            expanded = "true";
        }


        return `<div class="card m-1 border border-${borderColor}" name="session" id="sidebar-${index}">
        <div class="card-header">
            <a class="btn btn-${buttonColor} w-100" data-bs-toggle="collapse" href="#remote-session-id-${index}" role="button" aria-expanded="${expanded}" aria-controls="session-id-${index}">
                <strong class="text-center">${note.getSessionIndex()}: ${note.getSessionName()} - DM: ${note.getSessionDM().getName()}</strong>
            </a>
        </div>
        <div class="collapse ${active}" id="session-id-${index}">
            <div class="card-body p-1">
                <table class="table table-borderless table-sm">
                    ${characterTable}
                </table>
            </div>
            <div class="card-footer text-muted">
                <div class="row">
                    <div class="col-lg-4 col-xs-2 p-2">
                        <small>${this.formatDateForInputField(note.getSessionDate())}</small>
                    </div>
                    <div class="col-lg-8 col-xs-10 p-2 ms-auto">
                        <div class="row align-items-end">
                            <div class="col-8 ms-auto">
                                <button class="btn btn-primary btn-sm" id="sidebar-${index}-open" name="sidebar-open" data-toggle="tooltip" data-placement="top" title="Open session note"><i class="bi-check2-square"></i></button>
                                <button class="btn btn-success btn-sm" id="sidebar-${index}-copy" name="sidebar-copy" data-toggle="tooltip" data-placement="top" title="Copy markdown"><i class="bi-clipboard"></i></button>
                                <button class="btn btn-danger btn-sm" id="sidebar-${index}-delete" name="sidebar-delete" data-toggle="tooltip" data-placement="top" title="Delete session note"><i class="bi-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    }
    buildSidebarCardRemote(index) {
        
        // Get the note from the index provided
        let note = this.repo.getSessions()[index];
        let characters = note.getCharacters();
        let players = note.getPlayers();
        let characterTable = "";
        for (let i = 0; i < characters.length; i++) {
            let p = players.find(p => p.getID() == characters[i].getPlayer());
            characterTable += `<tr><td>${p.getName()}</td><td>${characters[i].getCharacter()}</td></tr>`
        }

        let buttonColor = 'primary';
        let borderColor = 'dark';
        let active = "";
        let expanded = "";
        if (this.remoteCurrentNote == index) {
            // This note is currently selected and gets special markdown
            buttonColor = 'warning';
            borderColor = 'warning';
            active = "show";
            expanded = "true";
        }



        return `<div class="card m-1 border border-${borderColor}" name="session" id="sidebar-remote-${index}">
        <div class="card-header">
            <a class="btn btn-${buttonColor} w-100" data-bs-toggle="collapse" href="#remote-session-id-${index}" role="button" aria-expanded="${expanded}" aria-controls="remote-session-id-${index}">
                <strong class="text-center">${note.getSessionIndex()}: ${note.getSessionName()} - DM: ${note.getSessionDM().getName()}</strong>
            </a>
        </div>
        <div class="collapse ${active}" id="remote-session-id-${index}">
            <div class="card-body p-1">
                <table class="table table-borderless table-sm">
                    ${characterTable}
                </table>
            </div>
            <div class="card-footer text-muted">
                <div class="row">
                    <div class="col-lg-4 col-xs-2 p-2">
                        <small>${this.formatDateForInputField(note.getSessionDate())}</small>
                    </div>
                    <div class="col-lg-8 col-xs-10 p-2 ms-auto">
                        <div class="row align-items-end">
                            <div class="col-8 ms-auto">
                                <button class="btn btn-primary btn-sm" id="sidebar-remote-${index}-open" name="sidebar-remote-open" data-toggle="tooltip" data-placement="top" title="Open session note"><i class="bi-check2-square"></i></button>
                                <button class="btn btn-success btn-sm" id="sidebar-remote-${index}-copy" name="sidebar-remote-copy" data-toggle="tooltip" data-placement="top" title="Copy markdown"><i class="bi-clipboard"></i></button>
                                <button class="btn btn-secondary btn-sm" id="sidebar-remote-${index}-get" name="sidebar-remote-get" data-toggle="tooltip" data-placement="top" title="Download session to local storage"><i class="bi-cloud-download"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    }

}