import { CartProvider } from '@/lib/cart-context'

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <CartProvider>
            {children}
        </CartProvider>
    )
}
