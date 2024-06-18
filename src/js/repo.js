import { createClient } from '@supabase/supabase-js';
import { note, goldItem, playerCharacter, player }  from './classes.js';
import toastr from 'toastr';

// Reference document
// https://supabase.com/docs/reference/javascript/start
export class repo {
    constructor() {

        this.supabase = createClient(SERVER_URL, APIKEY);
        this.playerList = new Array();
        this.characterList = new Array();
        this.sessionList = new Array();

        this.refreshRate = 0.25 * 60000; // Minutes * millisecond conversion. 1440 is a day. Date math gives a result in milliseconds.
        this.playerRefresh;
        this.characterRefresh;
        this.sessionRefresh;
        
        this.init();

    }
    async signIn() {
        // TODO: Something isn't working here.
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: USER,
            password: PASS
          })

    }

    async init() {
        // Initial first run set up

        // Ensure data is up to date
        await this.refreshCharacters();
        await this.refreshPlayers();
        
        await this.refreshSessions();


    }

    // **********************
    // Session repo functions
    // **********************
    async refreshSessions(override = false) {
        // Refresh the local session cache
        let sessionStorage = this.localSessions();
        this.sessionRefresh = sessionStorage.lastRefresh;
        let now = new Date();

        // If override is true, or there was no data, or the data is out of date
        if (override || this.sessionRefresh == null || (this.sessionRefresh - now) > this.refreshRate)
            sessionStorage.data = await this.fetchAllSessions();

        this.sessionList = sessionStorage.data;
        this.storeSessions();
    }
    async fetchAllSessions() {
        // Fetch the session data from the server
        const {data: sessions, sessionerror} = await this.supabase
            .from('sessions_v')
            .select('session_id, session_name, session_date, session_dm, session_item_id, item_type, item_name, item_value, player_id');
        const {data: playerConnections, playererror} = await this.supabase
            .from('player_links_v')
            .select('session_id, character_id');

        // Sort each session into its own array
        let sortedSessions = this.parseSessions(sessions, playerConnections);

        return sortedSessions;
    }
    async fetchSession(id) {
        // Fetch the session data from the server
        const {data: sessions, sessionerror} = await this.supabase
            .from('sessions_v')
            .select('session_id, session_name, session_date, session_dm, session_item_id, item_type, item_name, item_value, player_id')
            .eq('session_id', id);
        const {data: playerConnections, playererror} = await this.supabase
            .from('player_links_v')
            .select('session_id, character_id')
            .eq('session_id', id);

        // Sort each session into its own array
        let sortedSession = await this.parseSessions(sessions, playerConnections)[id];

        return sortedSession;
    }
    async parseSessions(sessions, playerConnections) {
        let sortedSessions = new Array();
        sessions.forEach((session) => {
            let id = session.session_id;
            if (!sortedSessions[id]) {
                sortedSessions[id] = new note();
                sortedSessions[id].setSessionIndex(id);
                sortedSessions[id].setSessionName(session.session_name);
                sortedSessions[id].setSessionDate(session.session_date);

                let dm = this.playerList.find(p => p.getID() == session.player_id);
                let dmchar =this.characterList.find(c => c.getID() == session.session_dm);
                sortedSessions[id].setSessionDM(dm);
                sortedSessions[id].setDMCharacter(dmchar);
            }
                
            // Item type table
            // 0: no items
            // 1: gold item each
            // 2: gold item total
            // 3: loot item
            // 4: highlight
            if (session.item_type != null) {
                switch(session.item_type) {
                    case 1:
                        sortedSessions[id].addGold(session.item_name, session.item_value, true);
                        break;
                    case 2:
                        sortedSessions[id].addGold(session.item_name, session.item_value, false);
                        break;
                    case 3:
                        sortedSessions[id].addLoot(session.item_name);
                        break;
                    case 4:
                        sortedSessions[id].addHighlight(session.item_name);
                        break;
                }
            }

        });

        // Adding characters links into the session
        playerConnections.forEach(async (connection) => {
            if (this.characterList.length >= 0) {
                await this.refreshCharacters();
            }
            let character = this.characterList.find(c => c.getID() == connection.character_id);
            sortedSessions[connection.session_id].addCharacter(character);

            if (this.playerList.length >= 0) {
                await this.refreshPlayers();
            }
            let player = this.playerList.find(p => p.getID() == character.getPlayer());
            sortedSessions[connection.session_id].addPlayer(player);
        });
        return sortedSessions;

    }
    async checkSession(id) {
        const {data: s, e} = await this.supabase
            .from('sessions')
            .select('session_id')
            .eq('session_id', id);
        return(s.length > 0);
    }
    async insertSession(session) {
        // Insert a session into the database
        // Data should be a note

        let id = session.getSessionIndex();

        // Check if the session exists already, we don't want to accidently override stuff. Ask for a confirmation
        let exists = await this.checkSession(id);
        if (exists) 
            this.updateSession(session); // Handle this with update session instead.
        else {
            // Translate the data to the database format for the sessions table
            //let sessiondate = new Date(session.getSessionDate()).toISOString().split("T")[0];
            const data = {
                session_id: id,
                session_name: session.getSessionName(),
                session_date: new Date(session.getSessionDate()).toISOString(),
                session_dm: session.getDMCharacter().getID()
            }

            // Insert the data.
            const {e} = await this.supabase
            .from('sessions')
            .insert(data);

            await this.addSessionLinks(session);
        }
    }
    async addSessionLinks(session) {
        let id = session.getSessionIndex();
        // Add character links
        let characters = session.getCharacters();
        let data = new Array();
        characters.forEach(async (c) => {
            let character = {
                session_id: id,
                character_id: c.getID()
            };
            data.push(character);
        });

        const {err} = await this.supabase
            .from('character_link')
            .insert(data);

        // Add session items
        let loot = session.getLoot();
        let gold = session.getGold();
        let highlights = session.getHighlights();
        data = new Array();

        // Item type table
        // 0: no items
        // 1: gold item each
        // 2: gold item total
        // 3: loot item
        // 4: highlight

        // Loop through the loot array and insert each one.
        loot.forEach(async (l) => {
            const item = {
                session_id: id,
                item_type: 3,
                item_value: 0,
                item_name: l
            };
            data.push(item);
        });

        // Loop through the gold array and insert each one
        gold.forEach(async (g) => {
            // Check what type of gold item it is.
            let type = 2;
            if (g.getIsEach())
                type = 1;

            const item = {
                session_id: id,
                item_type: type,
                item_value: g.getAmount(),
                item_name: g.getLabel()
            };
            data.push(item);
        });

        // Loop through highlights and insert each one
        highlights.forEach(async (h) => {
            const item = {
                session_id: id,
                item_type: 4,
                item_value: 0,
                item_name: h
            };
            data.push(item);
        });

        const {loot_err} = await this.supabase
            .from('session_items')
            .insert(data);


    }
    async deleteSession(id) {

        // Ask for confirmation, as this is destructive to existing data.
        let confirm = window.prompt("Deleting a remote session affects all users. This process cannot be undone. If you are sure, type DELETE below.").toLowerCase();
        if (confirm == 'delete') {
            // Delete all current session_items associated with that session
            const {error_items_del} = await this.supabase
            .from('session_items')
            .delete()
            .eq('session_id', id);

            // Delete all character_links associated with that session
            const {error_charlinks_del} = await this.supabase
            .from('character_link')
            .delete()
            .eq('session_id', id);

            // Delete the session entry and information
            const {error_session_del} = await this.supabase
            .from('sessions')
            .delete()
            .eq('session_id', id);

            // Remote session from local storage
            this.sessionList.splice(id, 1)
            this.storeSessions();
            
            toastr.success("Session deleted.");
        }


    }
    async updateSession(session) {
        let id = session.getSessionIndex();
        // Ask for confirmation, as this is destructive to existing data.
        let confirm = window.confirm("The session id " + id + " already exists. Are you sure you want to override the remote database version with your local copy?");
        if (confirm)
            confirm = window.confirm("Are you absolutely sure? This is a destructive process and cannot be undone.");

        if (confirm) {
            // Delete all current session_items associated with that session
            const {error_items_del} = await this.supabase
            .from('session_items')
            .delete()
            .eq('session_id', id);

            // Delete all character_links associated with that session
            const {error_charlinks_del} = await this.supabase
            .from('character_link')
            .delete()
            .eq('session_id', id);

            // Alter the values of the session
            const data = {
                session_id: id,
                session_name: session.getSessionName(),
                session_date: new Date(session.getSessionDate()).toISOString(),
                session_dm: session.getDMCharacter().getID()
            }

            const {error_session} = await this.supabase
            .from('sessions')
            .update(data)
            .eq('session_id', id);

            // Readd all session links
            await this.addSessionLinks(session);
        }
        

    }
    getSessions() {
        return this.sessionList;
    }
    getLatestIndex() {
        let id = this.sessionList.length - 1;
        return this.sessionList[id].getSessionIndex();
    }
    storeSessions() {
        // Store remote session information into local storage
        let storage = {
            lastRefresh: new Date(),
            data: this.sessionList
        };
        localStorage["remote-sessions"] = JSON.stringify(storage);
    }
    localSessions() {
        // Get stored remote session information from local storage
        let storage = {
            lastRefresh: new Date(0),
            data: new Array()
        };
        let notes;
        try {
            storage = JSON.parse(localStorage["remote-sessions"]);
            notes = storage.data;
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
            storage.lastRefresh = new Date(storage.lastRefresh);
            storage.data = notes;
        }
        catch {
            storage = {
                lastRefresh: null,
                data: new Array()
            };
        }
        
        return storage;
    }
    commitSession(note) {
        this.sessionList[note.getSessionIndex()] = note;
    }
    
    // *********************
    // Player repo functions
    // *********************
    async refreshPlayers(override) {
        // Refresh the local player cache
        let playerStorage = this.localPlayers();
        this.playerRefresh = playerStorage.lastRefresh;
        let now = new Date();

        // If override is true, or there was no data, or the data is out of date
        if (override || this.playerRefresh == null || (this.playerRefresh - now) > this.refreshRate)
            playerStorage.data = await this.fetchAllPlayers();
        
        this.playerList = playerStorage.data;
        this.storePlayers();
    }
    async fetchAllPlayers() {
        // Fetch the player data from the server
        const {data: players, error} = await this.supabase.from('players').select('player_id, created_at, playername');

        let playerArray = new Array(); // Clear the old list out
        players.forEach((pl) => {
            let p = new player(pl.playername, pl.player_id, new Date(pl.created_at)); // Translate SQL table results to player object
            playerArray.push(p); // Add back to our player list
        });
        return playerArray;
    }
    async fetchPlayer(id) {

    }
    async insertPlayer(insert) {
        const {data, error} = await this.supabase
        .from('players')
        .insert(insert)
        .select();

        let newPlayer = new player(data[0].playername, data[0].player_id, new Date(data[0].created_at));
        this.playerList.push(newPlayer);
        this.storePlayers();
        return newPlayer;
    }
    async deletePlayer(id) {

    }
    async updatePlayer(data) {

    }
    async getPlayers(id = -1) {
        let list = new Array();
        if (this.playerList.length == 0)
            list = await this.fetchAllPlayers();
        else
            list = this.playerList;
        
        if (id != -1) 
            list = list.filter(p => p.getID() == id);
        
        return list;
    }
    storePlayers() {
        // Store remote player information into local storage
        let storage = {
            lastRefresh: new Date(),
            data: this.playerList
        };
        localStorage["remote-players"] = JSON.stringify(storage);
    }
    localPlayers() {
        // Get stored remote player information from local storage
        let storage = {
            lastRefresh: null,
            data: new Array()
        };
        let players;
        try {
            storage = JSON.parse(localStorage["remote-players"]);
            players = storage.data;
            for (let i = 0; i < players.length; i++) {
                players[i] = Object.assign(new player, players[i]);
            }
            storage.lastRefresh = new Date(storage.lastRefresh);
            storage.data = players;
        }
        catch {
            storage = {
                lastRefresh: null,
                data: new Array()
            };
        }
        
        return storage;
    }


    // ************************
    // Character repo functions
    // ************************
    async refreshCharacters(override = false) {
        // Refresh the local character cache
        let characterStorage = this.localCharacters();
        this.characterRefresh = characterStorage.lastRefresh;
        let now = new Date();

        // If override is true, or there was no data, or the data is out of date
        if (override || this.characterRefresh == null || (this.characterRefresh - now) > this.refreshRate)
            characterStorage.data = await this.fetchAllCharacters();

        this.characterList = characterStorage.data;
        this.storeCharacters();
    }
    async fetchAllCharacters() {
        // Fetch the character data from the server
        const {data: characters, error} = await this.supabase.from('characters').select('character_id, created_at, player_id, character_name');

        let characterArray = new Array(); // Clear the old list out

        characters.forEach((ch) => {
            let c = new playerCharacter(ch.player_id, ch.character_name, ch.character_id, new Date(ch.created_at)); // Translate SQL table results to character object
            
            characterArray.push(c); // Add back to our character list
        });
        return characterArray;
    }
    async fetchCharacter(id) {

    }
    async insertCharacter(insert) {
        const {data, error} = await this.supabase
        .from('characters')
        .insert(insert)
        .select();

        // constructor(player = -1, character = "", ID = -1, created = new Date())
        let newCharacter = new playerCharacter(data[0].player_id, data[0].character_name, data[0].character_id, new Date(data[0].created_at));
        this.characterList.push(newCharacter);
        this.storeCharacters();
        return newCharacter;

    }
    async deleteCharacter(id) {

    }
    async updateCharacter(data) {

    }
    getCharacters(id = -1) {
        let list;
        if (id == -1)
            list = this.characterList;
        else
            list = this.characterList.filter(c => c.getPlayer() == id);
        return list;
    }
    storeCharacters() {
        // Store remote character information into local storage
        let storage = {
            lastRefresh: new Date(),
            data: this.characterList
        };
        localStorage["remote-characters"] = JSON.stringify(storage);
    }
    localCharacters() {
        // Get stored remote character information from local stroage
        let storage = {
            lastRefresh: null,
            data: new Array()
        };
        let characters;
        try {
            storage = JSON.parse(localStorage["remote-characters"]);
            characters = storage.data;
            for (let i = 0; i < characters.length; i++) {
                characters[i] = Object.assign(new playerCharacter, characters[i]);
            }
            storage.lastRefresh = new Date(storage.lastRefresh);
            storage.data = characters;
        }
        catch {
            storage = {
                lastRefresh: null,
                data: new Array()
            };
        }
        
        return storage;
    }

}