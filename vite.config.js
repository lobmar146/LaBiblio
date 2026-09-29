import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  build: {
    rolldownOptions: {
      output: {
        // Las librerías cambian poco: en chunks propios quedan en la caché del navegador entre deploys.
        codeSplitting: {
          groups: [
            { name: 'mui', test: /node_modules[/\\](@mui|@emotion)/ },
            { name: 'supabase', test: /node_modules[/\\]@supabase/ },
            { name: 'react', test: /node_modules[/\\](react|react-dom|react-router|react-router-dom|scheduler)[/\\]/ },
          ],
        },
      },
    },
  },
})
