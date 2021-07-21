import nProgress from "nprogress"
import 'nprogress/nprogress.css'
import Vue from "vue"
import VueRouter from "vue-router"
const files = require.context(".", true, /\.js$/)

nProgress.configure({ showSpinner: false, easing: 'ease', speed: 500 })

Vue.use(VueRouter)
Vue.use(nProgress)  // 路由跳转进度

let configRouters = []

files.keys().forEach((key) => {
  if (["./index.js"].includes(key)) return;
  // 读取文件中的default模块
  configRouters = configRouters.concat(files(key).default);
})

// 默认路由配置
const defaultRoutes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "登陆", component: () => import("@/views/login") },
]

// 拼装路由
const routes = defaultRoutes.concat(configRouters)

const router = new VueRouter({
  mode: "history",
  routes,
})

/* 处理点击重复路由报错的问题 */
const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err)
}

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push= function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

/* 守卫 */
router.beforeEach( (to, from, next) => {
  nProgress.start()
  let { path, name } = to
  window.bus.$emit("add-breadcrumb", { path, name })
  next()
})

router.afterEach( () => nProgress.done() )

export { router, configRouters }
