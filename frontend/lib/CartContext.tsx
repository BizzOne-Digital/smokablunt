"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
export interface CartItem { id:string; name:string; price:number; category:string; image:string; quantity:number; amount:string; }
interface Ctx { items:CartItem[]; addItem:(i:Omit<CartItem,"quantity">)=>void; removeItem:(id:string,amount:string)=>void; updateQty:(id:string,amount:string,q:number)=>void; clearCart:()=>void; totalItems:number; totalPrice:number; }
const C = createContext<Ctx|undefined>(undefined);
export function CartProvider({ children }:{ children:ReactNode }) {
  const [items,setItems] = useState<CartItem[]>([]);
  // key = id + amount combo so same product with different amounts stacks separately
  const key = (id:string, amount:string) => `${id}__${amount}`;
  const addItem = useCallback((ni:Omit<CartItem,"quantity">) =>
    setItems(p => {
      const k = key(ni.id, ni.amount);
      const e = p.find(i => key(i.id,i.amount) === k);
      return e ? p.map(i => key(i.id,i.amount)===k ? {...i,quantity:i.quantity+1} : i) : [...p,{...ni,quantity:1}];
    }),[]);
  const removeItem = useCallback((id:string,amount:string) =>
    setItems(p=>p.filter(i=>key(i.id,i.amount)!==key(id,amount))),[]);
  const updateQty = useCallback((id:string,amount:string,q:number) => {
    if(q<1){removeItem(id,amount);return;}
    setItems(p=>p.map(i=>key(i.id,i.amount)===key(id,amount)?{...i,quantity:q}:i));
  },[removeItem]);
  const clearCart = useCallback(()=>setItems([]),[]);
  const totalItems  = items.reduce((s,i)=>s+i.quantity,0);
  const totalPrice  = items.reduce((s,i)=>s+i.price*i.quantity,0);
  return <C.Provider value={{items,addItem,removeItem,updateQty,clearCart,totalItems,totalPrice}}>{children}</C.Provider>;
}
export const useCart = () => { const c=useContext(C); if(!c) throw new Error("useCart outside CartProvider"); return c; };