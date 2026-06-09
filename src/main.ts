import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './ui/router'
import { AUTH_GATEWAY, USE_CASES } from './ui/di'
import { createAuthGateway, createUseCases } from './compositionRoot'

const app = createApp(App)
app.provide(USE_CASES, createUseCases())
app.provide(AUTH_GATEWAY, createAuthGateway())
app.use(router)
app.mount('#app')
