import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'PriceTrace',
  description: 'Track. Compare. Win.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
