import { createRouter, createWebHistory } from 'vue-router';
import Game from '@/pages/Game.vue';
import Leaderboard from '@/pages/Leaderboard.vue';

const routes = [
  { path: '/', component: Game },
  { path: '/leaderboard', component: Leaderboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
