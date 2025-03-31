<template>
  <div class="leaderboard">
    <h2>Таблица лидеров</h2>
    <ul>
      <li v-for="(player, index) in leaderboard.players" :key="index">
        {{ index + 1 }}. {{ player.name }} – {{ player.time }} сек
      </li>
    </ul>
    <RouterLink to="/">Назад</RouterLink>
  </div>
</template>

<script setup>
import { useLeaderboardStore } from '@/stores/leaderboard';

const leaderboard = useLeaderboardStore();
</script>

<style scoped>
.leaderboard {
  text-align: center;
  padding: 20px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  font-size: 18px;
  margin: 5px 0;
}
a {
  display: inline-block;
  margin-top: 10px;
  font-size: 18px;
  color: blue;
}
</style>
