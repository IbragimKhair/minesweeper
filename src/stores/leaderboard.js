import { defineStore } from 'pinia';

export const useLeaderboardStore = defineStore('leaderboard', {
  state: () => ({ players: JSON.parse(localStorage.getItem('leaderboard')) || [] }),
  actions: {
    addRecord(name, time) {
      this.players.push({ name, time });
      this.players.sort((a, b) => a.time - b.time);
      this.players = this.players.slice(0, 10);
      localStorage.setItem('leaderboard', JSON.stringify(this.players));
    }
  }
});
