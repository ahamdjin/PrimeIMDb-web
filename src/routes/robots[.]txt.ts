import {createFileRoute} from '@tanstack/react-router'
export const Route=createFileRoute('/robots.txt')({server:{handlers:{GET:()=>new Response('User-agent: *\nAllow: /\nDisallow: /search\nSitemap: '+(process.env.SITE_URL||'https://example.com')+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain'}})}}})
