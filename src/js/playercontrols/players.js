import { playerCharacter, player }  from '../classes.js';
import { repo } from '../repo';
import { playerDisplay } from './players-display.js';

export class PlayerTab {
    constructor(repo) {
        this.repo = repo;
        this.display = new playerDisplay(repo);

        this.currentPlayer = 0;

        this.$playerList = document.querySelector('#player-list');
        this.$playerRefresh = document.querySelector('#player-refresh-button');
        this.$playerAddEntry = document.querySelector('#player-add-name');
        this.$playerAddButton = document.querySelector('#player-add-button');

        this.$playerMainTab = document.querySelector('#players-tab'); // This is the main tab to bring the entire players section

        this.refreshPlayerList = this.refreshPlayerList.bind(this);
        this.selectPlayer = this.selectPlayer.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
        this.addCharacter = this.addCharacter.bind(this);
        this.characterTabEventHandler = this.characterTabEventHandler.bind(this);

        this.$playerRefresh.addEventListener("click", this.refreshPlayerList);
        this.$playerMainTab.addEventListener("click", this.refreshPlayerList);
        this.$playerList.addEventListener("change", this.selectPlayer);
        this.$playerAddButton.addEventListener("click", this.addPlayer);


    }

    async selectPlayer() {
        this.currentPlayer = this.$playerList.value;
        let player = await this.repo.getPlayers(this.currentPlayer);
        if (player.length == 1) {
            player = player[0];
            this.display.updatePlayerSection(player);

            let characters = await this.repo.getCharacters(this.currentPlayer);
            this.display.populateCharTabs(characters);
            this.characterTabEventHandler();
            
        }
    }
    async refreshPlayerList() {
        await this.repo.refreshPlayers(true);
        await this.repo.refreshCharacters(true);
        let list = await this.repo.getPlayers();
        this.display.populatePlayerSelect(list);
        this.$playerList.value = this.currentPlayer;
    }

    async addPlayer() {
        let data = {playername: this.$playerAddEntry.value};
        if (data.playername != "") {
            let newPlayer = await this.repo.insertPlayer(data);
            this.currentPlayer = newPlayer.getID();
            this.display.populatePlayerSelect(await this.repo.getPlayers());
            this.$playerAddEntry.value = "";
            this.$playerList.value = this.currentPlayer;
            await this.selectPlayer();
        }
    }


    async addCharacter() {
        let characterName = document.querySelector('#player-character-add-name');
        let data = {
            character_name: characterName.value,
            player_id: this.currentPlayer
        }; // Need player_id and character_name


        if (data.character_name != ""
            && data.player_id > -1) {

            let newCharacter = await this.repo.insertCharacter(data);

            let characters = await this.repo.getCharacters(this.currentPlayer);
            this.display.populateCharTabs(characters);
            this.characterTabEventHandler();
        }
    }

    characterTabEventHandler() {
        let input = document.querySelector('#player-character-add-name'); //TODO: Will add pressing enter to it eventually
        let button = document.querySelector('#player-character-add-button');

        button.addEventListener('click', this.addCharacter);

    }

}