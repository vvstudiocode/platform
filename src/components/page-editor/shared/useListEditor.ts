/**
 * 共用列表編輯 Hook
 * 用於處理編輯器中常見的列表操作：新增、刪除、更新項目
 */

export function useListEditor<T extends Record<string, any>>(
    items: T[],
    key: string,
    onChange: (props: Record<string, any>) => void
) {
    const add = (defaultItem: T) => {
        onChange({ [key]: [...items, defaultItem] })
    }

    const remove = (index: number) => {
        onChange({ [key]: items.filter((_, i) => i !== index) })
    }

    const update = (index: number, field: keyof T, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        onChange({ [key]: newItems })
    }

    const move = (fromIndex: number, toIndex: number) => {
        const newItems = [...items]
        const [removed] = newItems.splice(fromIndex, 1)
        newItems.splice(toIndex, 0, removed)
        onChange({ [key]: newItems })
    }

    return { items, add, remove, update, move }
}
