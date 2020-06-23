// src/index.js

import Vue from 'vue'
import popup from './popup.vue'

Vue.config.productionTip = false;

new Vue({
    render: h => h(popup)
}).$mount("#app");
