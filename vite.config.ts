import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './extension/manifest.json'
import Icons from 'unplugin-icons/vite'
import type { UserConfig } from 'vite'
const config: UserConfig = {
  plugins: [
    vue(),
    crx( { manifest }),
    Icons({ compiler: 'vue3' }),

  ],
  
  
  
}


// https://vitejs.dev/config/
export default config
