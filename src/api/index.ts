import { activeBackend } from '@/store/setup'
import type { Config, Proxy, ProxyProvider, Rule, RuleProvider } from '@/types'
import { useWebSocket } from '@vueuse/core'
import axios from 'axios'
import { computed, ref, watch } from 'vue'

axios.interceptors.request.use((config) => {
  config.baseURL =
    activeBackend.value?.protocol +
    '://' +
    activeBackend.value?.host +
    ':' +
    activeBackend.value?.port
  config.headers['Authorization'] = 'Bearer ' + activeBackend.value?.password
  return config
})

export const version = ref()
export const fetchVersionAPI = () => {
  return axios.get<{ version: string }>('/version')
}
export const isSingBox = computed(() => version.value.includes('sing-box'))
export const zashboardVersion = ref(__APP_VERSION__)

watch(
  activeBackend,
  async (val) => {
    if (val) {
      const { data } = await fetchVersionAPI()

      version.value = data.version
    }
  },
  { immediate: true },
)

export const fetchProxiesAPI = () => {
  return axios.get<{ proxies: Record<string, Proxy> }>('/proxies')
}

export const selectProxyAPI = (proxyGroup: string, name: string) => {
  return axios.put(`/proxies/${encodeURIComponent(proxyGroup)}`, { name })
}

export const fetchProxyLatencyAPI = (proxyName: string, url: string, timeout: number) => {
  return axios.get<{ delay: number }>(`/proxies/${encodeURIComponent(proxyName)}/delay`, {
    params: {
      url,
      timeout,
    },
  })
}

export const fetchProxyGroupLatencyAPI = (proxyName: string, url: string, timeout: number) => {
  return axios.get<{ delay: number }>(`/group/${encodeURIComponent(proxyName)}/delay`, {
    params: {
      url,
      timeout,
    },
  })
}

export const fetchProxyProviderAPI = () => {
  return axios.get<{ providers: Record<string, ProxyProvider> }>('/providers/proxies')
}

export const updateProxyProviderAPI = (name: string) => {
  return axios.put(`/providers/proxies/${encodeURIComponent(name)}`)
}

export const proxyProviderHealthCheckAPI = (name: string) => {
  return axios.get<Record<string, number>>(
    `/providers/proxies/${encodeURIComponent(name)}/healthcheck`,
    {
      timeout: 15000,
    },
  )
}

export const fetchRulesAPI = () => {
  return axios.get<{ rules: Rule[] }>('/rules')
}

export const fetchRuleProvidersAPI = () => {
  return axios.get<{ providers: Record<string, RuleProvider> }>('/providers/rules')
}

export const updateRuleProviderAPI = (name: string) => {
  return axios.put(`/providers/rules/${encodeURIComponent(name)}`)
}

export const disconnectByIdAPI = (id: string) => {
  return axios.delete(`/connections/${id}`)
}

export const disconnectAllAPI = () => {
  return axios.delete('/connections')
}

export const getConfigsAPI = () => {
  return axios.get<Config>('/configs')
}

export const patchConfigsAPI = (configs: Record<string, string>) => {
  return axios.patch('/configs', configs)
}

export const flushFakeIPAPI = () => {
  return axios.post('/cache/fakeip/flush')
}

export const reloadConfigsAPI = () => {
  return axios.put('/configs?reload=true', { path: '', payload: '' })
}

export const upgradeUIAPI = () => {
  return axios.post('/upgrade/ui')
}

const createWebSocket = <T>(url: string, searchParams?: Record<string, string>) => {
  const backend = activeBackend.value
  const resurl = new URL(
    `${backend?.protocol === 'https' ? 'wss' : 'ws'}://${backend?.host}:${backend?.port}/${url}`,
  )

  resurl.searchParams.append('token', backend?.password || '')

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      resurl.searchParams.append(key, value)
    })
  }

  return useWebSocket<T>(resurl, {
    autoClose: false,
    autoReconnect: true,
  })
}

export const fetchConnectionsAPI = <T>() => {
  return createWebSocket<T>('connections')
}

export const fetchLogsAPI = <T>(params: Record<string, string> = {}) => {
  return createWebSocket<T>('logs', params)
}
