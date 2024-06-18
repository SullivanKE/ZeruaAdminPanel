import { note, goldItem, playerCharacter, player }  from '../classes.js';

export class playerDisplay { 
    constructor() {

        this.$playerList = document.querySelector('#player-list');
        
        this.$headName = document.querySelector('#player-head-name');
        this.$headDate = document.querySelector('#player-head-date');
        this.$headGames = document.querySelector('#player-head-games');
        this.$headLastPlayed = document.querySelector('#player-head-last');

        this.$playerTabs = document.querySelector('#player-tabs');
        this.$playerContent = document.querySelector('#player-content');

        
    }

    populatePlayerSelect(list) {
        let options = "";
        list.forEach((p) => {
            options += `<option value=${p.getID()}>${p.getName()}</option>`;
        });
        this.$playerList.innerHTML = options;
    }
    updatePlayerSection(player) {

        this.$headName.innerHTML = player.getName();
        this.$headDate.innerHTML = player.getCreated();
        this.$headGames.innerHTML = "Work in progress"; // Requires a bit of work
        this.$headLastPlayed.innerHTML = "Work in progress"; // Requires a bit of work
        
    }

    populateCharTabs(characters) {
        let tabs = "";
        let content = "";
        let active = "true";
        let show = "active show";
        characters.forEach((c) => {
            tabs += this.buildCharTab(c, show, active);
            content += this.buildCharTabContent(c, show);
            show = "";
            active = "false";
        });
        tabs += this.buildAddCharTab();
        
        this.$playerTabs.innerHTML = tabs;
        this.$playerContent.innerHTML = content;

    }

    buildCharTab(character, show, active) {
        return `<li class="nav-item" role="presentation">
            <button class="nav-link" id="player-tab-${character.getID()}" data-bs-toggle="tab" data-bs-target="#player-tab-content-${character.getID()}"
                type="button" role="tab" aria-controls="player-tab-content-${character.getID()}" aria-selected="${active}">${character.getCharacter()}</button>
        </li>`;
    }
    buildAddCharTab() {
        return `
        <li class="nav-item" role="presentation">
            <div class="input-group">
                <input class="form-control border border-dark" placeholder="Add a new character..." type="text" id="player-character-add-name" />
                <button class='btn btn-sm btn-success' id="player-character-add-button"><i class="bi bi-person-plus-fill"></i></button>
            </div>
        </li>`;
    }

    buildCharTabContent(character, show) {
        return `<div class="tab-pane fade ${show} p-2" id="player-tab-content-${character.getID()}"
        role="tabpanel" aria-labelledby="player-tab-${character.getID()}">
        <table class="table">
        <tr>
            <td>
                Character name:
            </td>
            <td>
                ${character.getCharacter()}
            </td>
        </tr>
        <tr>
            <td>
                Level:
            </td>
            <td>
                ${'Work in Progress'}
            </td>
        </tr>
        <tr>
            <td>
                Status:
            </td>
            <td>
                ${'Work in Progress'}
            </td>
        </tr>
        <tr>
            <td>
                Date Created:
            </td>
            <td>
                ${character.getCreated()}
            </td>
        </tr>
        <tr>
            <td>
                Total games played:
            </td>
            <td>
                ${'Work in Progress'}
            </td>
        </tr>
        <tr>
            <td>
                Last game played:
            </td>
            <td>
                ${'Work in Progress'}
            </td>
        </tr>
    </table>
    <button class="btn btn-secondary" data-toggle="tooltip" data-placement="top"
    title="Unlock the table above for editing. This button will become a save button, and 'Add Event' will become cancel.">Edit Character WIP</button>
    <button class="btn btn-warning float-end" data-toggle="tooltip" data-placement="top"
    title="Add an event, such as character death, ressurection, retirement, or something else.">Add Event WIP</button>
    </div>`;

    }
}