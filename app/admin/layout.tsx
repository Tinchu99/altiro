import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/admin/matches" className="text-xl font-bold font-display text-primary">
                        Al tiro Admin
                    </Link>
                    <nav className="flex gap-4">
                        <Link href="/admin/matches" className="text-sm font-medium hover:text-primary">
                            Matches
                        </Link>
                        <Link href="/" className="text-sm font-medium hover:text-primary">
                            Volver al sitio
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    );
}
