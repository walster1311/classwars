import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CLASSVERSE — Real-Time Multiplayer 3D Virtual Classroom',
  description: 'Interactive miniature isometric 3D virtual classroom for teachers and students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 overflow-hidden h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
