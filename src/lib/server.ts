import { createServerFn } from '@tanstack/react-start'
import { trending, discover, search, details, providers,genres,person } from './tmdb'
export const getHome=createServerFn({method:'GET'}).handler(async()=>{const [movies,tv,free]=await Promise.all([trending('movie'),trending('tv'),discover('movie',{free:true})]);return {movies,tv,free:free.items}})
export const getBrowse=createServerFn({method:'GET'}).validator((v:{kind:'movie'|'tv';page?:number;genre?:number;free?:boolean})=>v).handler(({data})=>discover(data.kind,data))
export const getSearch=createServerFn({method:'GET'}).validator((v:{q:string})=>v).handler(({data})=>search(data.q.slice(0,100)))
export const getDetails=createServerFn({method:'GET'}).validator((v:{kind:'movie'|'tv';id:number})=>v).handler(async({data})=>{const [item,where]=await Promise.all([details(data.kind,data.id),providers(data.kind,data.id)]);return {item,where}})
export const getGenres=createServerFn({method:'GET'}).handler(()=>genres('movie'))
export const getPerson=createServerFn({method:'GET'}).validator((v:{id:number})=>v).handler(({data})=>person(data.id))
