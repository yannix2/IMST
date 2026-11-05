// Light or dark. A visitor's choice is kept in this browser; without one, the page follows the
// device setting. The script below runs in <head> before the first paint (no flash of the
// wrong theme) and keeps following the device until the visitor chooses.
export const themeKey = "maarif-theme";
export type Theme = "light" | "dark";

// It also marks <html> with "js", so effects that need a script (rolling figures) can start
// from their first frame instead of flashing their final state.
export const themeScript = `(function(){var d=document.documentElement;d.classList.add("js");var k=${JSON.stringify(themeKey)},m=window.matchMedia("(prefers-color-scheme: dark)");function s(){var t=null;try{t=localStorage.getItem(k)}catch(e){}d.dataset.theme=t==="dark"||t==="light"?t:m.matches?"dark":"light"}s();m.addEventListener("change",s)})();`;
