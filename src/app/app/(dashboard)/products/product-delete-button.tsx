'use client'

import { deleteProduct } from './actions'
import { DeleteButton } from '@/components/ui/delete-button'

interface Props {
    productId: string
    productName: string
}

export function AppProductDeleteButton({ productId, productName }: Props) {
    return (
        <DeleteButton
            itemId={productId}
            itemName={productName}
            onDelete={deleteProduct}
        />
    )
}
