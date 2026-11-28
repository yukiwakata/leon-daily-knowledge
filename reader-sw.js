const scope=new URL(self.registration.scope);
const prefix="leon-reader-lite:"+scope.pathname+":";
const name=prefix+"4220e86887aa8f5d";
const files=["lite.html","covers/thumb-828270592bd003e9.webp","covers/thumb-b19c9b080d5b458a.webp","covers/thumb-6781a5f5a33ac92c.webp"].map(p=>new URL(p,scope).href);
self.addEventListener("install",e=>e.waitUntil((async()=>{
 const cache=await caches.open(name);
 await cache.addAll(files.map(url=>new Request(url,{cache:"reload"})));
 await self.skipWaiting();
})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(k=>k.startsWith(prefix)&&k!==name).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener("fetch",e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=="GET"||u.origin!==scope.origin||u.search)return;
 const navigation=e.request.mode==="navigate"&&[scope.pathname,scope.pathname+"index.html",scope.pathname+"lite.html"].includes(u.pathname);
 if(navigation)e.respondWith((async()=>{
  const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),5500);
  try{const res=await fetch(e.request,{signal:abort.signal});if(res.ok||res.status<500)return res;throw Error("upstream");}
  catch(err){const cached=await (await caches.open(name)).match(files[0]);if(cached)return cached;throw err;}
  finally{clearTimeout(timer);}
 })());
 else if(files.slice(1).includes(u.href))e.respondWith((async()=>(await (await caches.open(name)).match(u.href))||fetch(e.request))());
});
