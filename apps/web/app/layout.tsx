import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'MetaSeniorLife',
  description: 'Cuidados ao residente para lares, ligado ao MetaSenior.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
