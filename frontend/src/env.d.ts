/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_LOGO_URL: string
  readonly VITE_PROJECT_TITLE: string
  // dopisz inne zmienne VITE_ jakie masz w .env
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


