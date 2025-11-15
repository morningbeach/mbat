/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Env {
    DB: D1Database
    ASSETS: R2Bucket
  }
}

export {}
