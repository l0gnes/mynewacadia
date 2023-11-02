// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules : [
    "@nuxt/ui",
    "@nuxtjs/supabase",
    "@formkit/nuxt"
  ],

  supabase : {
    redirect: false
  },

  ssr: false,

  nitro : {
    experimental : { openAPI : true }
  },

  ui: {
    icons: ['heroicons', 'mingcute']
  }
})
