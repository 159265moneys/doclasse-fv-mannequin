import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root = resolve('public');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
http.createServer((req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    let file = resolve(root,'.'+decodeURIComponent(url.pathname));
    if (!file.startsWith(root+sep) && file!==root) {res.writeHead(403).end(); return;}
    if(statSync(file).isDirectory()) file=resolve(file,'index.html');
    const stat=statSync(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache'});
    createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('FV preview: http://localhost:4173'));
