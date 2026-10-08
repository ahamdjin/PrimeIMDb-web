export type Kind='movie'|'tv'
export type Movie={id:number;kind:Kind;title:string;year:string;overview:string;poster:string|null;backdrop:string|null;rating:number;votes:number;genres:{id:number;name:string}[];runtime?:number;release?:string;tagline?:string;cast?:{id:number;name:string;character?:string;profile_path?:string|null}[];directors?:{id:number;name:string}[];trailers?:{key:string;name:string}[];similar?:Movie[];seasons?:{id:number;name:string;season_number:number;episode_count:number}[]}
export type Providers={link?:string;free?:{provider_name:string;logo_path:string}[];ads?:{provider_name:string;logo_path:string}[];flatrate?:{provider_name:string;logo_path:string}[];rent?:{provider_name:string;logo_path:string}[];buy?:{provider_name:string;logo_path:string}[]}
const image=(p?:string|null,size='w500')=>p?`https://image.tmdb.org/t/p/${size}${p}`:null
export {image}
async function query<T>(path:string,params:Record<string,string|number|undefined>={}):Promise<T|null>{
 const token=process.env.TMDB_API_READ_TOKEN,key=process.env.TMDB_API_KEY
 if(!token&&!key)return null
 const u=new URL('https://api.themoviedb.org/3'+path)
 for(const [k,v] of Object.entries(params))if(v!==undefined)u.searchParams.set(k,String(v))
 if(!token&&key)u.searchParams.set('api_key',key)
 try{const r=await fetch(u,{headers:token?{Authorization:`Bearer ${token}`}:{},signal:AbortSignal.timeout(12000)});return r.ok?await r.json() as T:null}catch{return null}
}
function clean(x:any,kind:Kind):Movie{return {id:x.id,kind,title:x.title||x.name||'Untitled',year:(x.release_date||x.first_air_date||'').slice(0,4),release:x.release_date||x.first_air_date,overview:x.overview||'',poster:image(x.poster_path),backdrop:image(x.backdrop_path,'w1280'),rating:Number(x.vote_average||0),votes:Number(x.vote_count||0),genres:x.genres||[],runtime:x.runtime||x.episode_run_time?.[0],tagline:x.tagline||'',seasons:x.seasons}}
export async function trending(kind:'all'|Kind='all'){const r=await query<{results:any[]}>(`/trending/${kind}/week`);return (r?.results||[]).filter(x=>x.media_type!=='person').map(x=>clean(x,x.media_type==='tv'?'tv':kind==='tv'?'tv':'movie'))}
export async function discover(kind:Kind,opts:{genre?:number;free?:boolean;page?:number;region?:string}={}){const p:Record<string,string|number|undefined>={page:Math.min(Math.max(opts.page||1,1),500),sort_by:'popularity.desc',include_adult:'false'};if(opts.genre)p.with_genres=opts.genre;if(opts.free){p.watch_region=opts.region||'US';p.with_watch_monetization_types='free|ads'}const r=await query<{results:any[];total_pages:number}>(`/discover/${kind}`,p);return {items:(r?.results||[]).map(x=>clean(x,kind)),pages:Math.min(r?.total_pages||1,500)}}
export async function search(q:string){const r=await query<{results:any[]}>('/search/multi',{query:q,include_adult:'false'});return (r?.results||[]).filter(x=>x.media_type==='movie'||x.media_type==='tv').map(x=>clean(x,x.media_type))}
export async function details(kind:Kind,id:number){const d=await query<any>(`/${kind}/${id}`,{append_to_response:'credits,videos,recommendations,external_ids'});if(!d?.id)return null;const m=clean(d,kind);m.cast=(d.credits?.cast||[]).slice(0,18);m.directors=(d.credits?.crew||[]).filter((p:any)=>p.job==='Director').slice(0,5);m.trailers=(d.videos?.results||[]).filter((v:any)=>v.site==='YouTube'&&v.type==='Trailer').slice(0,3);m.similar=(d.recommendations?.results||[]).slice(0,12).map((v:any)=>clean(v,kind));return m}
export async function providers(kind:Kind,id:number,region='US'){const d=await query<{results:Record<string,Providers>}>(`/${kind}/${id}/watch/providers`);return d?.results?.[region.toUpperCase()]||null}
export async function genres(kind:Kind){const d=await query<{genres:{id:number;name:string}[]}>(`/genre/${kind}/list`);return d?.genres||[]}
export async function person(id:number){return query<any>(`/person/${id}`,{append_to_response:'combined_credits'})}
