const KEY='flipshift.v1';
const def=()=>({unlocked:1,best:{},settings:{sfx:.6,shake:true,timer:true}});
export function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s?{...def(),...s,settings:{...def().settings,...s.settings}}:def()}catch{return def()}}
export function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}
