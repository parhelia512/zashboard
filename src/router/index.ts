import { ROUTE_NAME } from '@/config'
import { i18n } from '@/i18n'
import { language } from '@/store/settings'
import { activeBackend } from '@/store/setup'
import ConnectionsPage from '@/views/ConnectionsPage.vue'
import HomePage from '@/views/HomePage.vue'
import LogsPage from '@/views/LogsPage.vue'
import OverviewPage from '@/views/OverviewPage.vue'
import ProxiesPage from '@/views/ProxiesPage.vue'
import RulesPage from '@/views/RulesPage.vue'
import SettingsPage from '@/views/SettingsPage.vue'
import SetupPage from '@/views/SetupPage.vue'
import { useTitle } from '@vueuse/core'
import { watch } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: ROUTE_NAME.proxies,
      component: HomePage,
      children: [
        {
          path: 'overview',
          name: ROUTE_NAME.overview,
          component: OverviewPage,
        },
        {
          path: 'proxies',
          name: ROUTE_NAME.proxies,
          component: ProxiesPage,
        },
        {
          path: 'connections',
          name: ROUTE_NAME.connections,
          component: ConnectionsPage,
        },
        {
          path: 'logs',
          name: ROUTE_NAME.logs,
          component: LogsPage,
        },
        {
          path: 'rules',
          name: ROUTE_NAME.rules,
          component: RulesPage,
        },
        {
          path: 'settings',
          name: ROUTE_NAME.settings,
          component: SettingsPage,
        },
      ],
    },
    {
      path: '/setup',
      name: ROUTE_NAME.setup,
      component: SetupPage,
    },
    {
      path: '/:catchAll(.*)',
      redirect: ROUTE_NAME.proxies,
    },
  ],
})

const title = useTitle('zashboard')
const setTitleByName = (name: string | symbol | undefined) => {
  if (typeof name === 'string' && activeBackend.value) {
    title.value = `zashboard | ${i18n.global.t(name)}`
  } else {
    title.value = 'zashboard'
  }
}

router.beforeEach((to) => {
  if (!activeBackend.value && to.name !== ROUTE_NAME.setup) {
    router.push({ name: ROUTE_NAME.setup })
  }
})

router.afterEach((to) => {
  setTitleByName(to.name)
})

watch(language, () => {
  setTitleByName(router.currentRoute.value.name)
})

export default router
