import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

const RTL_LOCALES = ['ar', 'ur', 'fa'];

export type SupportedLocale = 'en' | 'ar' | 'ur' | 'fa' | 'tr' | 'ku';

export function useLanguage() {
    const { currentLocale, setLocale, t, loading } = useLaravelReactI18n();
    const locale = currentLocale();
    const isRtl = RTL_LOCALES.includes(locale);

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    }, [locale, isRtl]);

    const switchLanguage = (newLocale: SupportedLocale) => {
        router.get(`/locale/${newLocale}`, {}, {
            onSuccess: () => {
                setLocale(newLocale);
                document.documentElement.lang = newLocale;
                document.documentElement.dir = RTL_LOCALES.includes(newLocale) ? 'rtl' : 'ltr';
            },
        });
    };

    return {
        t,
        language: locale,
        currentLocale,
        setLanguage: setLocale,
        setLocale,
        switchLanguage,
        isRtl,
        loading,
    };
}
