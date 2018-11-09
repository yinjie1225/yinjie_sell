// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';
import goods from 'components/goods/goods';
import ratings from 'components/ratings/ratings'
import seller from 'components/seller/seller';
import VueResource from 'vue-resource'

import "common/stylus/index.styl"

Vue.use(VueRouter);
Vue.use(VueResource);

const routers=[
  {path:'/goods',component:goods},
  {path:'/ratings',component:ratings},
  {path:'/seller',component:seller},
  ];
const router = new VueRouter({
  routes:routers,
  linkActiveClass:'active'
});

new Vue({
    router,
  components: {App},
  render: h => h(App)
  // template: '<App/>'
}).$mount('#app')
router.push({path:'/goods',component:goods});
