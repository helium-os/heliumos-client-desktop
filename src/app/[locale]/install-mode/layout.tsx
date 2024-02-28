import { ReactNode } from 'react';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Locale } from '@/config';

type Props = {
    children: ReactNode;
    params: { locale: Locale };
};

export default function Layout({ children, params: { locale } }: Props) {
    unstable_setRequestLocale(locale);

    return <>{children}</>;
}
