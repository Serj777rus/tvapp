import { createApp } from 'vue'
import App from './App.vue'
import Home from './components/Home.vue';
import Auth from './components/Auth.vue';
import { library } from '@fortawesome/fontawesome-svg-core'

import { fas } from '@fortawesome/free-solid-svg-icons'

import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { faL } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import 'normalize.css';
import { createRouter, createWebHistory } from 'vue-router';

library.add(fas);
library.add(fab);
library.add(far);
library.add(faL);

const router = createRouter({
    routes: [{
        path: '/',
        component: Home,
        name: 'home'
        },
        {
        path: '/auth',
        component: Auth,
        name: 'auth'
        }
    ],
    history: createWebHistory()
})

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router);
app.mount('#app')
