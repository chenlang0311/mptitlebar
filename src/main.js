import Vue from 'vue'
import App from './App.vue'
// import MpVueTitlebar from "./plugin/index.js"
import MpVueTitlebar2 from '../dist/mpTitlebar.umd'
// Vue.use(MpVueTitlebar)
Vue.use(MpVueTitlebar2)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
