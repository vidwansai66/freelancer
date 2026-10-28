import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function htmlSeoPlugin(): Plugin {
  return {
    name: 'html-seo-plugin',
    transformIndexHtml(html) {
      const verificationToken =
        process.env.VITE_GOOGLE_SITE_VERIFICATION ||
        process.env.GOOGLE_SITE_VERIFICATION;
      if (verificationToken && verificationToken.trim()) {
        const metaTag = `    <meta name="google-site-verification" content="${verificationToken.trim()}" />\n`;
        return html.replace('</head>', `${metaTag}  </head>`);
      }
      return html;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), htmlSeoPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/sitemap.xml': 'http://localhost:5000',
      '/robots.txt': 'http://localhost:5000',
    },
  },
})

