import "../css/app.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./echo";
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { LaravelReactI18nProvider } from "laravel-react-i18n";

const appName = import.meta.env.VITE_APP_NAME || "LipaBnb";

// Pre-load all page components
const pages = import.meta.glob("./Pages/**/*.tsx", { eager: false });

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pagePath = `./Pages/${name}.tsx`;
        return resolvePageComponent(pagePath, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        const initialLocale = props.initialPage?.props?.locale || "en";
        root.render(
            <LaravelReactI18nProvider
                locale={initialLocale}
                fallbackLocale="en"
                files={import.meta.glob("/lang/*.json")}
            >
                <App {...props} />
            </LaravelReactI18nProvider>
        );
    },
    progress: {
        color: "#FFF5F7",
    },
});
