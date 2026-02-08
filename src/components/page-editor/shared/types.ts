// 共用編輯器類型定義

export interface EditorProps {
    props: Record<string, any>
    onChange: (props: Record<string, any>) => void
    tenantId?: string
}

export interface ListItem {
    [key: string]: any
}
