export const meta = () => ([
    { title: "Not Found | ResuMatch AI" },
    { name: "description", content: "Page not found" },
]);

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                <p className="text-xl text-text-secondary mb-8">Page not found</p>
                <a href="/" className="inline-block px-6 py-3 bg-primary text-white rounded-full hover:opacity-90">
                    Return to Home
                </a>
            </div>
        </div>
    );
}
