const CACHE_PREFIX = 'taskflow-shell-'
const CACHE_NAME = `${CACHE_PREFIX}v5`
const APP_BASE_URL = new URL('./', self.registration.scope)
const INDEX_URL = new URL('index.html', APP_BASE_URL)
const ASSET_MANIFEST_URL = new URL('asset-manifest.json', APP_BASE_URL)
const MANIFEST_URL = new URL('manifest.webmanifest', APP_BASE_URL)
const ICON_URL = new URL('icon.svg', APP_BASE_URL)
const MASKABLE_ICON_URL = new URL('icon-maskable.svg', APP_BASE_URL)
const ICON_192_URL = new URL('icon-192.png', APP_BASE_URL)
const ICON_512_URL = new URL('icon-512.png', APP_BASE_URL)
const MASKABLE_ICON_PNG_URL = new URL('icon-maskable-512.png', APP_BASE_URL)

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll([
        APP_BASE_URL.href,
        INDEX_URL.href,
        ASSET_MANIFEST_URL.href,
        MANIFEST_URL.href,
        ICON_URL.href,
        MASKABLE_ICON_URL.href,
        ICON_192_URL.href,
        ICON_512_URL.href,
        MASKABLE_ICON_PNG_URL.href,
      ])

      const indexResponse = await cache.match(INDEX_URL.href)
      if (!indexResponse) throw new Error('The app shell index was not precached.')

      const indexMarkup = await indexResponse.text()
      const assetManifestResponse = await cache.match(ASSET_MANIFEST_URL.href)
      if (!assetManifestResponse) throw new Error('The production asset manifest was not precached.')
      const assetManifest = await assetManifestResponse.json()
      const buildAssetPaths = Object.values(assetManifest).flatMap((entry) => [
        entry.file,
        ...(entry.css ?? []),
        ...(entry.assets ?? []),
      ])
      const indexAssetPaths = [...indexMarkup.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
        .map(([, value]) => value)
      const assetUrls = [...new Set(
        [...buildAssetPaths, ...indexAssetPaths]
          .map((path) => new URL(path, APP_BASE_URL))
          .filter((url) => url.origin === APP_BASE_URL.origin && url.pathname.startsWith(APP_BASE_URL.pathname))
          .map((url) => url.href),
      )]

      await cache.addAll(assetUrls)
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const requestUrl = new URL(request.url)
  if (request.method !== 'GET' || requestUrl.origin !== APP_BASE_URL.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        let response
        try {
          response = await fetch(request)
        } catch {
          const cachedPage = await cache.match(request)
          const appShell = cachedPage ?? await cache.match(INDEX_URL.href)
          if (appShell) return appShell
          throw new Error('The app is offline and its cached shell is unavailable.')
        }
        if (response.ok) await cache.put(INDEX_URL.href, response.clone())
        return response
      })(),
    )
    return
  }

  if (requestUrl.search || !requestUrl.pathname.startsWith(APP_BASE_URL.pathname)) return
  if (!requestUrl.pathname.includes('/assets/') &&
      ![
        MANIFEST_URL.pathname,
        ICON_URL.pathname,
        MASKABLE_ICON_URL.pathname,
        ICON_192_URL.pathname,
        ICON_512_URL.pathname,
        MASKABLE_ICON_PNG_URL.pathname,
      ].includes(requestUrl.pathname)) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cachedAsset = await cache.match(request, { ignoreVary: true })
      if (cachedAsset) return cachedAsset

      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone())
      return response
    })(),
  )
})
