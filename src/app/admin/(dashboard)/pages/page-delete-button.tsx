'use client'

import { deletePage } from './actions'
import { DeleteButton } from '@/components/ui/delete-button'

interface Props {
    pageId: string
    pageName: string
}

export function PageDeleteButton({ pageId, pageName }: Props) {
    return (
        <DeleteButton
            itemId={pageId}
            itemName={pageName}
            onDelete={deletePage}
        />
    )
}
