export type Visit={pageid:number;title:string};
export function transition<T extends Visit>(current:T,path:Visit[],stack:T[],next:T,clicks:number,targetId:number,backwards=false){
 if(current.pageid===next.pageid)return {changed:false,path,stack,clicks,won:false};
 return {changed:true,path:[...path,next],stack:backwards?stack.slice(0,-1):[...stack,next],clicks:clicks+1,won:next.pageid===targetId};
}
