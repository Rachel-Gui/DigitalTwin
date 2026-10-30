import { createContext, useContext, useLayoutEffect, useState } from "react";

const ThemeContext = createContext(null);
const storageKey = "decarbcitytwin-theme";
export function ThemeProvider({children}) {
  const [theme,setTheme]=useState(()=>{
    try { return localStorage.getItem(storageKey)==="dark"?"dark":"light"; }
    catch { return "light"; }
  });
  useLayoutEffect(()=>{
    document.documentElement.dataset.theme=theme;
    try { localStorage.setItem(storageKey,theme); } catch { /* Browsing storage may be disabled. */ }
  },[theme]);
  return <ThemeContext.Provider value={{theme,toggleTheme:()=>setTheme(value=>value==="dark"?"light":"dark")}}>{children}</ThemeContext.Provider>;
}
export const useTheme = ()=>useContext(ThemeContext);
