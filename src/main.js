/* eslint-disable no-console */
import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import Vuelidate from 'vuelidate'

import router from './router'
import store from './store'

Vue.use(Vuelidate)

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://xlb-project-261809.firebaseio.com'
// axios.defaults.headers.common['Authorization'] = 'asfsadd'
axios.defaults.headers.get['Accepts'] = 'application/json'

const reqInterceptor = axios.interceptors.request.use(config => {
  console.log('Request Interceptor', config)
  return config
})
const resInterceptor = axios.interceptors.response.use(res => {
  console.log('Response Interceptor', res)
  return res
})

// Removing the interceptors
axios.interceptors.request.eject(reqInterceptor)
axios.interceptors.request.eject(resInterceptor)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
