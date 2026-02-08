// 共用對齊按鈕元件
export function AlignmentButtons({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    return (
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {[
                { value: 'left', label: '左' },
                { value: 'center', label: '中' },
                { value: 'right', label: '右' },
            ].map((align) => (
                <button
                    key={align.value}
                    type="button"
                    onClick={() => onChange(align.value)}
                    className={`flex-1 py-1.5 text-xs rounded transition-colors ${(value || 'center') === align.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {align.label}
                </button>
            ))}
        </div>
    )
}
