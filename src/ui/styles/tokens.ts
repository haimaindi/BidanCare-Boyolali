export const tokens = {
  colors: {
    primary: {
      base: "bg-purple-700",
      hover: "hover:bg-purple-800",
      text: "text-purple-700",
      light: "bg-purple-50",
      border: "border-purple-200",
    },
    surface: {
      base: "bg-white",
      subtle: "bg-gray-50",
    },
    text: {
      base: "text-gray-900",
      muted: "text-gray-500",
      inverse: "text-white",
    },
    border: {
      base: "border-gray-200",
      focus: "focus:border-purple-700",
    },
    status: {
      success: "text-emerald-700 bg-emerald-50 border-emerald-200",
      warning: "text-amber-700 bg-amber-50 border-amber-200",
      error: "text-rose-700 bg-rose-50 border-rose-200",
      info: "text-blue-700 bg-blue-50 border-blue-200",
    },
  },
  spacing: {
    // Using rem units as requested
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  radii: {
    base: "rounded-md",
    full: "rounded-full",
    none: "rounded-none",
  },
  typography: {
    fontFamily: "font-sans",
    h1: "text-2xl font-semibold tracking-tight",
    h2: "text-xl font-semibold tracking-tight",
    h3: "text-lg font-medium",
    body: "text-base",
    small: "text-sm",
  }
};
