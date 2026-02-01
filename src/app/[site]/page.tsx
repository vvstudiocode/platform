export default async function StorefrontPage({ params }: { params: Promise<{ site: string }> }) {
    const { site } = await params
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-zinc-900 text-white">
            <h1 className="text-4xl font-bold">Store: {site}</h1>
            <p className="mt-4">Welcome to this shop!</p>
        </div>
    )
}
