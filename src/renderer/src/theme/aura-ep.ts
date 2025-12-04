import Aura from "@primevue/themes/aura";

// Element Plus の既定プライマリーパレットを PrimeVue のデザイントークンへ写経したプリセット拡張
const AuraEP = {
  ...(Aura as any),
  semantic: {
    ...((Aura as any).semantic ?? {}),
    primary: {
      50: "#ecf5ff",
      100: "#d9ecff",
      200: "#c6e2ff",
      300: "#a0cfff",
      400: "#73b8ff",
      500: "#409eff",
      600: "#3a8ee6",
      700: "#3577c4",
      800: "#2f5fa2",
      900: "#244f8a",
      950: "#1c3a66"
    }
  }
} as const;

export default AuraEP;
