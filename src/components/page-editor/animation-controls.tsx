
// 動畫控制元件
export function AnimationControls({ animation, onChange }: { animation?: { type: string; duration?: string; delay?: string }; onChange: (props: any) => void }) {
    const handleChange = (field: string, value: string) => {
        onChange({
            animation: {
                ...animation,
                [field]: value
            }
        })
    }

    return (
        <div className="space-y-3 pt-3 border-t border-border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">進場動畫</label>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">效果</label>
                    <select
                        value={animation?.type || 'none'}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm text-foreground"
                    >
                        <option value="none">無</option>
                        <option value="fade-in">淡入 (Fade In)</option>
                        <option value="fade-in-up">向上淡入 (Fade Up)</option>
                        <option value="fade-in-down">向下淡入 (Fade Down)</option>
                        <option value="fade-in-left">向右淡入 (Fade Left)</option>
                        <option value="fade-in-right">向左淡入 (Fade Right)</option>
                        <option value="zoom-in">放大 (Zoom In)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">速度</label>
                    <select
                        value={animation?.duration || 'normal'}
                        onChange={(e) => handleChange('duration', e.target.value)}
                        className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm text-foreground"
                    >
                        <option value="slower">極慢</option>
                        <option value="slow">慢</option>
                        <option value="normal">正常</option>
                        <option value="fast">快</option>
                        <option value="faster">極快</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
