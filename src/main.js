import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';

axios.defaults.baseURL = "http://proofofconcept-env.eba-tcvjpjdm.us-east-1.elasticbeanstalk.com";
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
