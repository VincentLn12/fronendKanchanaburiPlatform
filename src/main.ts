import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import sweetalert from './plugins/sweetalert'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(sweetalert)

app.mount('#app')
