// TODO: Move all display functions in notes to over here. I should have done that to begin with.

export class NoteDisplay {
    constructor() {



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

    buildHighlightRow(index, highlight) {
        return `<tr name="highlight-row"><td class="text-break">${highlight}</td><td><button class="btn btn-danger btn-sm w-100" name="highlight-del-button" id="highlight-${index}-delete">Remove</button></td></tr>`;
    }
    buildHighlightRowRemote(index, highlight) {
        return `<tr name="highlight-row"><td class="text-break">${highlight}</td></tr>`;
    }

    

    
}