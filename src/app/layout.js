import './globals.css';
import Providers from './Providers';

const LOGO_URL = 'https://wisdom-lib.vercel.app/wisdom-logo.png';

export const metadata = {
  metadataBase: new URL('https://wisdom-lib.vercel.app'),
  title: 'Wisdom Library — Where Knowledge Lives',
  description: 'Join the Wisdom Library family. A curated space for learners, thinkers, and book lovers.',
  icons: {
    icon: LOGO_URL,
    shortcut: LOGO_URL,
    apple: LOGO_URL,
  },
  openGraph: {
    title: 'Wisdom Library — Where Knowledge Lives',
    description: 'Join the Wisdom Library family. A curated space for learners, thinkers, and book lovers.',
    images: [LOGO_URL],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={LOGO_URL} />
        <link rel="shortcut icon" href={LOGO_URL} />
        <link rel="apple-touch-icon" href={LOGO_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
