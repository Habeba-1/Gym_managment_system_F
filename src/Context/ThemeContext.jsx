import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
            root.setAttribute("data-mantine-color-scheme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            root.setAttribute("data-mantine-color-scheme", "light");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
