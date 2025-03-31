<script setup>
import { RouterView, RouterLink } from 'vue-router';
</script>

<template>
  <nav>
    <RouterLink to="/">Игра</RouterLink>
    <RouterLink to="/leaderboard">Лидерборд</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>
nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px;
  background: lightgray;
}
a {
  text-decoration: none;
  font-size: 18px;
}
</style>
