import "../css/app.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./echo";
import { createRoot } from "react-dom/client";
import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { LaravelReactI18nProvider } from "laravel-react-i18n";
import { getCsrfToken } from "./utils/csrf";

// Send CSRF token with every Inertia request (fixes 419 on login, signup, forms)
router.on("before", (event) => {
  const token = getCsrfToken();
  if (token) {
    event.detail.visit.headers["X-XSRF-TOKEN"] = token;
  }
});

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
