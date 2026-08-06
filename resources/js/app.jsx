import "../css/app.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./echo";
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { LaravelReactI18nProvider } from "laravel-react-i18n";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { setExchangeRates, setSupportedCurrencies } from "./utils/currency";
import GlobalFlashToasts from "./components/GlobalFlashToasts";

const appName = import.meta.env.VITE_APP_NAME || "LipaBnb";

// Pre-load all page components
const pages = import.meta.glob("./Pages/**/*.tsx", { eager: false });

function syncCurrencyPropsFromPage(page) {
    if (!page?.props) return;
    if (page.props.supportedCurrencies) {
        setSupportedCurrencies(page.props.supportedCurrencies);
    }
    if (page.props.exchangeRates) {
        setExchangeRates(page.props.exchangeRates);
    }
    if (typeof document !== "undefined") {
        document.dispatchEvent(new Event("currencies:updated"));
    }
}

// Wrapping each page in an inline function inside resolve() would hand Inertia a brand-new
// component identity on every single visit, forcing React to unmount/remount the whole page
// (and lose all of its local state) even for same-page revisits like a failed form submission.
// Caching the wrapper per page name keeps identity stable across visits.
const wrappedPages = new Map();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pagePath = `./Pages/${name}.tsx`;
        return resolvePageComponent(pagePath, pages).then((module) => {
            if (!wrappedPages.has(name)) {
                const Page = module.default;
                const PageWithFlash = (props) => (
                    <>
                        <GlobalFlashToasts />
                        <Page {...props} />
                    </>
                );
                wrappedPages.set(name, PageWithFlash);
            }
            return { default: wrappedPages.get(name) };
        });
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        const initialLocale = props.initialPage?.props?.locale || "en";
        const initialCurrency = props.initialPage?.props?.auth?.user?.currency || null;
        const initialAuthenticated = Boolean(props.initialPage?.props?.auth?.user);
        syncCurrencyPropsFromPage(props.initialPage);
        if (typeof document !== "undefined") {
            const onInertiaPage = (e) => {
                syncCurrencyPropsFromPage(e.detail?.page);
            };
            document.addEventListener("inertia:success", onInertiaPage);
            document.addEventListener("inertia:navigate", onInertiaPage);
        }
        root.render(
            <LaravelReactI18nProvider
                locale={initialLocale}
                fallbackLocale="en"
                files={import.meta.glob("/lang/*.json")}
            >
                <CurrencyProvider
                    initialCurrency={initialCurrency}
                    initialAuthenticated={initialAuthenticated}
                >
                    <App {...props} />
                </CurrencyProvider>
            </LaravelReactI18nProvider>
        );
    },
    progress: {
        color: "#FFF5F7",
    },
});
