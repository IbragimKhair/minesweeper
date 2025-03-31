<template>
  <div class="game">
    <h2>Сапер</h2>
    <div v-if="!gameStarted" class="settings">
      <div class="difficulties">
        <label v-for="option in difficulties" :key="option.level">
          <input type="radio" v-model="selectedDifficulty" :value="option">
          {{ option.label }}
        </label>
        <label>
          <input type="radio" v-model="selectedDifficulty" :value="customDifficulty">
          Кастомный режим
        </label>
      </div>
      <div v-if="selectedDifficulty === customDifficulty" class="custom">
        <input type="number" v-model.number="customDifficulty.rows" placeholder="Введите количство строк">
        <input type="number" v-model.number="customDifficulty.cols" placeholder="Введите количество столбцов">
        <input type="number" v-model.number="customDifficulty.mines" placeholder="Введите количество мин">
      </div>
      <button @click="startGame" :disabled="!selectedDifficulty">Начать игру</button>
    </div>

    <div v-if="gameStarted" class="board">
      <h3>Поле {{ rows }}на{{ cols }} || Мин {{ mines }}</h3>
      <div class="timer">Время: {{ time }}</div>
      <div class="mine-counter">Оставшиеся мины: {{ remainingMines }}</div>
      <button @click="restartGame">Перезапустить</button>
      <button @click="goBackToSettings">Назад к настройкам</button>
      <div v-if="gameOver" class="game-over">Игра окончена!</div>
      <div v-if="victory" class="victory">Ты победил!</div>
      <div class="grid" :style="{ gridTemplateColumns: `repeat(${cols}, 30px)`}">
        <div v-for="(cell, index) in grid"
          :key="index"
          class="cell"
          :class="{ mine: cell.mine && cell.open, open: cell.open, wrong: cell.wrongFlag }"
          @click="expendCell(index)"
          @contextmenu.prevent="putFlag(index)">
          <img v-if="cell.open && cell.mine && !cell.flagged" src="/src/mine.png" alt="Мина">
          <span v-if="cell.open && cell.wrongFlag">X</span>
          <span 
            v-if="cell.open && !cell.mine && !cell.wrongFlag" 
            :data-value="cell.value">
            {{ cell.value || "" }}
          </span>
          <img v-if="cell.flagged" class="flag" src="/src/flag.png" alt="Флаг">
        </div>
      </div>     
    </div>
  </div>
</template>


<script>
import { useLeaderboardStore } from '../stores/leaderboard'
export default {
  data() {
    return {
      gameStarted: false,
      selectedDifficulty: null,
      customDifficulty: { level: "custom", label: "Кастомный", rows: 10, cols: 10, mines: 10 },
      difficulties: [
      { level: "easy", label: "Простой (8x8, 10 мин)", rows: 8, cols: 8, mines: 10 },
      { level: "medium", label: "Средний (16x16, 40 мин)", rows: 16, cols: 16, mines: 40 },
      { level: "hard", label: "Сложный (32x16, 100 мин)", rows: 16, cols: 32, mines: 100 }
      ],
      rows: 0,
      cols: 0,
      mines: 0,
      grid: [],
      remainingMines: 0,
      gameOver: false,
      victory: false,
      time: 0,
      playerName: '',
      timer: null
    };
  },
  methods: {
    startGame() {
      if (this.selectedDifficulty) {
        this.rows = this.selectedDifficulty.rows;
        this.cols = this.selectedDifficulty.cols;
        this.mines = Math.min(this.selectedDifficulty.mines, this.rows * this.cols - 1);
        this.gameStarted = true;
        this.remainingMines = this.mines;
        this.gameOver = false;
        this.victory = false;
        this.time = 0;
        this.fillGrid();
        this.startTimer();
      }

    },
    fillGrid() {
      this.grid = Array.from({ length: this.rows * this.cols}, () => ({ mine: false, open: false, value: 0 }));
      let minePositions = new Set();
      while (minePositions.size < this.mines) {
        minePositions.add(Math.floor(Math.random() * this.grid.length));
      }
      minePositions.forEach(pos => {this.grid[pos].mine = true});
      for (let i = 0; i < this.grid.length; i++) {
        if (this.grid[i].mine) continue;

        const neighbors = this.findNeighbors(i);
        const mineCount = neighbors.filter(neighbor => this.grid[neighbor].mine).length;
        this.grid[i].value = mineCount;
      }
    },
    expendCell(index) {
      if (this.grid[index].open || this.grid[index].flagged || this.gameOver) return;
      this.grid[index].open = true;
      if (this.grid[index].mine) {
        this.gameOver = true;
        clearInterval(this.timer);
        this.openAllCells();
      } else if (this.grid[index].value === 0) {
        this.findNeighbors(index).forEach(i => this.expendCell(i));
      }
      this.checkVictory();
    },
    findNeighbors(index) {
      const neighbors = [];
      const row = Math.floor(index / this.cols);
      const col = index % this.cols;

      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && !(r === row && c === col)) {
            neighbors.push(r * this.cols + c);
          }
        }
      }
      return neighbors;
    },
    openAllCells() {
      this.grid.forEach(cell => {
        if (cell.mine) {
          cell.open = true;
        }
        if (cell.flagged && !cell.mine) {
          cell.wrongFlag = true; 
        }
      });
    },
    putFlag(index) {
      if (this.grid[index].open || this.gameOver) return;
      
      if (this.grid[index].flagged) {
        this.grid[index].flagged = false;
        this.remainingMines++;
      } else {
        this.grid[index].flagged = true;
        this.remainingMines--; 
      }
    },
    checkVictory() {
      if (this.gameOver) return;

      const notOpenCells = this.grid.filter(cell => !cell.open && !cell.mine);
      if (notOpenCells.length === 0) {
        this.victory = true;
        clearInterval(this.timer);

        setTimeout(() => {
          this.askForName();
        }, 500);
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (!this.gameOver) {
          this.time++;
        }
      }, 1000);
    },
    saveRecord() {
      const leaderboardStore = useLeaderboardStore()
      leaderboardStore.addRecord(this.playerName, this.time)
      this.$router.push('/leaderboard')
    },
    goBackToSettings() {
      this.gameStarted = false;
      this.selectedDifficulty = null;
      this.rows = 0;
      this.cols = 0;
      this.mines = 0;
      this.grid = [];
      this.gameOver = false;
      this.victory = false;
      this.time = 0;
      clearInterval(this.timer);
      this.timer = null;
    },
    restartGame() {
      if (this.selectedDifficulty) {
        this.gameOver = false;
        this.victory = false;
        this.time = 0;
        this.remainingMines = this.mines;
        this.fillGrid();
        clearInterval(this.timer);
        this.startTimer();
      }
    },
    askForName() {
      this.playerName = prompt("Поздравляем! Введите ваше имя для таблицы лидеров:");
      if (this.playerName && this.playerName.trim()) {
        this.saveRecord();
      }
    },
  }
}

</script>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.grid {
  display: grid;
  gap: 2px;
  justify-content: center;
}

.difficulty-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}
input {
  display: block;
  margin: 5px auto;
  padding: 5px;
  font-size: 16px;
}
button {
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 10px;
}
.grid {
  display: grid;
  margin: 20px auto;
  gap: 2px;
  max-width: 90%;
}
.cell {
  width: 30px;
  height: 30px;
  background-color: rgb(110, 170, 223);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 1px solid rgb(2, 7, 25);
  cursor: pointer;
  position: relative;
}
.cell span {
  font-weight: bold;
  font-size: 18px;
}

.cell span[data-value="1"] { color: blue; }
.cell span[data-value="2"] { color: green; }
.cell span[data-value="3"] { color: red; }
.cell span[data-value="4"] { color: darkblue; }
.cell span[data-value="5"] { color: brown; }
.cell span[data-value="6"] { color: turquoise; }
.cell span[data-value="7"] { color: black; }
.cell span[data-value="8"] { color: white; }


.open {
  background-color: rgb(176, 218, 241);
}

.cell img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cell:hover {
  background-color: darkgray;
}
.mine {
  background-color: rgb(245, 78, 78);
}
.mine img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.game-over {
  color: red;
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}
.victory {
  color: rgb(0, 255, 51);
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}
</style>
