import './general';
import init from './pollcreator/emoji.js';
import { Polls } from './pollcreator/pollCreator.js';
import { PlayerTab } from './playercontrols/players.js';
import { sessionNotes } from './notegenerator/notes.js';
import { repo } from './repo.js';


class Main {
    constructor() {

        // Versioning information.
        // If the current version is less than the last supported, we'll need to reset local storage.
        // This happens when the data structures are misaligned and would require a migration
        // Because the data isn't important, it's better to wipe it clean here.
        this.currentVer = 1.103;
        this.lastSupportedVersion = 1.102;
        console.log("[Zerua Admin]:", this.getVer());
        if (    this.getVer() == null || 
                this.lastSupportedVersion > this.getVer() ||
                false) {
            this.resetStorage();
            console.log("[Zerua Admin]: Storage reset");
        }
            
        this.storeVer();

        this.repo = new repo();
        this.note = new sessionNotes(this.repo);
        this.player = new PlayerTab(this.repo);
        this.polls = new Polls(this.repo);

    }
    storeVer() {
        // Store version information into local storage
        localStorage["version"] = this.currentVer;
    }
    getVer() {
        // Get version information from local storage to see if we have upgraded
        let version = 0;
        try {
            version = localStorage["version"];
        }
        catch {
            version = null;
        }
        return version;
    }
    resetStorage() {
        // Reset all local storage
        localStorage["version"] = null;

        localStorage["allNotes"] = null;

        localStorage["remote-sessions"] = null;
        localStorage["remote-players"] = null;
        localStorage["remote-characters"] = null;
    }
}


let main;
window.onload = () => {
    main = new Main();
}