import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Restore saved primary color and theme before first render
(() => {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') document.documentElement.classList.add('light');

  const hex = localStorage.getItem('primaryColor');
  if (hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      const hv = Math.round(h * 360), sv = Math.round(s * 100), lv = Math.round(l * 100);
      const val = `${hv} ${sv}% ${lv}%`;
      document.documentElement.style.setProperty('--primary', val);
      document.documentElement.style.setProperty('--ring', val);
      const fgL = lv > 50 ? 6 : 98;
      document.documentElement.style.setProperty('--primary-foreground', `${hv} ${sv}% ${fgL}%`);
    }
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
