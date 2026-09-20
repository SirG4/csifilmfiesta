import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'CSI Film Fiesta',
  description: 'CSI Film Fiesta — Ford v Ferrari screening',
  icons: { icon: '/assets/favicon.svg' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
