type ThemeColors = "Blue" | "Green" | "Purple" | "Pink" | "Orange"
interface ThemeColorStateParams{
    themeColor: ThemeColors;
    setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>> 
} 