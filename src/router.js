import VueRouter from 'vue-router'

export const routes = [
  {
    path: '/',
    component: () => import('./components/WebGL/AppUIs/Landing/LandingPage.vue')
  },
  {
    path: '/docs',
    component: () => import('./components/WebGL/AppUIs/QuickStart/DocsLayout.vue'),
    children: [
      {
        path: 'quick-start',
        component: () => import('./components/WebGL/AppUIs/QuickStart/QuickStart.vue'),
      }
    ]
  },
  {
    path: '*',
    component: () => import('./components/WebGL/AppUIs/Shared/E404.vue')
  }
]

export const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior (to, from, savedPos) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (savedPos) {
          resolve(savedPos)
        } else {
          resolve({ x: 0, y: 0 })
        }
      }, 1)
    })
  }
})