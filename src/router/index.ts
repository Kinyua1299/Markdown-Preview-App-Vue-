import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import EditorPage from '../views/EditorPage.vue'
import ErrorTest from '../views/ErrorTest.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/app', name: 'Editor', component: EditorPage },
    { path: '/error-test', name: 'ErrorTest', component: ErrorTest },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
})

export default router

