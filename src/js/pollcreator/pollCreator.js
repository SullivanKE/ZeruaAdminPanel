import { repo } from '../repo.js';
export class Polls {
    constructor(repo) {
        this.repo = repo;
        this.pollsTab = document.getElementById('polls-tab');
        this.pollsTab.addEventListener('click', this.construction);
    }
    construction() {
        window.alert('This page is under construction. Any elements you see here do not function and exist only as placeholder UI/UX for testing and feedback purposes.');
    }
}