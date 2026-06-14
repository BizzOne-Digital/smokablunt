"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
export interface CartItem { id:string; name:string; price:number; category:string; image:string; quantity:number; }
interface Ctx { items:CartItem[]; addItem:(i:Omit<CartItem,"quantity">)=>void; removeItem:(id:string)=>void; updateQty:(id:string,q:number)=>void; clearCart:()=>void; totalItems:number; totalPrice:number; }
const C = createContext<Ctx|undefined>(undefined);
export function CartProvider({ children }:{ children:ReactNode }) {
  const [items,setItems] = useState<CartItem[]>([]);
  const addItem    = useCallback((ni:Omit<CartItem,"quantity">) => setItems(p => { const e=p.find(i=>i.id===ni.id); return e?p.map(i=>i.id===ni.id?{...i,quantity:i.quantity+1}:i):[...p,{...ni,quantity:1}]; }),[]);
  const removeItem = useCallback((id:string) => setItems(p=>p.filter(i=>i.id!==id)),[]);
  const updateQty  = useCallback((id:string,q:number) => { if(q<1){removeItem(id);return;} setItems(p=>p.map(i=>i.id===id?{...i,quantity:q}:i)); },[removeItem]);
  const clearCart  = useCallback(()=>setItems([]),[]);
  const totalItems = items.reduce((s,i)=>s+i.quantity,0);
  const totalPrice = items.reduce((s,i)=>s+i.price*i.quantity,0);
  return <C.Provider value={{items,addItem,removeItem,updateQty,clearCart,totalItems,totalPrice}}>{children}</C.Provider>;
}
export const useCart = () => { const c=useContext(C); if(!c) throw new Error("useCart outside CartProvider"); return c; };
