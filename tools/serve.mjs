import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root = resolve('public');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json','.mp4':'video/mp4','.mjs':'text/javascript; charset=utf-8','.wasm':'application/wasm'};
http.createServer((req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    let file = resolve(root,'.'+decodeURIComponent(url.pathname));
    if (!file.startsWith(root+sep) && file!==root) {res.writeHead(403).end(); return;}
    if(statSync(file).isDirectory()) file=resolve(file,'index.html');
    const stat=statSync(file);
    const headers={'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    if(range) {
      const start=Number(range[1]), end=Math.min(Number(range[2]||stat.size-1),stat.size-1);
      if(start>end){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
      res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${stat.size}`});
      if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
    } else {
      res.writeHead(200,{...headers,'Content-Length':stat.size});
      if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
    }
  } catch {res.writeHead(404).end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('FV preview: http://localhost:4173'));
