export const MenuDocsData = [
  {
    type: 'router',
    name: 'Quick Start',
    path: '/docs/quick-start',
    component: () => import('../DocsContent/QuickStart.vue')
  },
  {
    type: 'router',
    name: 'Overview',
    path: '/docs/overview',
    component: () => import('../DocsContent/Overview.vue')
  },
  {
    type: 'router',
    name: 'Code Walkthrouh',
    path: '/docs/code-walkthrough',
    component: () => import('../DocsContent/CodeStructure.vue')
  },
  {
    type: 'router',
    name: 'Virtual Room',
    path: '/docs/event-space',
    component: () => import('../EventSpace/EventSpace.vue')
  },
  {
    type: 'router',
    name: 'Virtual Room (2nd CPU)',
    path: '/docs/event-space-2nd-cpu',
    component: () => import('../EventSpaceCPU2/EventSpaceCPU2.vue')
  }
]
export const MenuListData = [
  {
    type: 'router',
    name: 'Home',
    path: '/'
  },
  ...MenuDocsData
]