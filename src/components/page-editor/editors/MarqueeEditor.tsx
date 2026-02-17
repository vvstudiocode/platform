import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditorProps } from "../shared/types"
import { SpacingControls, FontSizeControls } from "../responsive-controls"

export function MarqueeEditor({ props, onChange }: EditorProps) {
    const {
        text = "WELCOME TO OUR STORE",
        speed = 30,
        direction = "left",
        pauseOnHover = true,
        backgroundColor = "#000000",
        textColor = "#FFFFFF",
        fontSizeDesktop = 60,
        fontSizeMobile = 36,
        paddingYDesktop = 64,
        paddingYMobile = 32
    } = props || {}

    const handleChange = (key: string, value: any) => {
        onChange({
            ...props,
            [key]: value
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>跑馬燈內容</Label>
                <Input
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('text', e.target.value)}
                    placeholder="輸入跑馬燈文字"
                />
            </div>

            <SpacingControls
                paddingY={{ desktop: paddingYDesktop, mobile: paddingYMobile }}
                onChange={(updates) => {
                    const newProps = { ...props, ...updates }
                    onChange(newProps)
                }}
            />

            <FontSizeControls
                fontSize={{ desktop: fontSizeDesktop, mobile: fontSizeMobile }}
                onChange={(updates) => {
                    const newProps = { ...props, ...updates }
                    // Also update legacy fontSize for backward compatibility if needed,
                    // though we use fontSizeDesktop/Mobile primarily now.
                    if (updates.fontSizeDesktop) {
                        (newProps as any).fontSize = updates.fontSizeDesktop
                    }
                    onChange(newProps)
                }}
                min={12}
                max={200}
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>文字顏色</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={textColor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('textColor', e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={textColor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('textColor', e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>背景顏色</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={backgroundColor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('backgroundColor', e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={backgroundColor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('backgroundColor', e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </div>
            </div>


            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>捲動速度 ({speed})</Label>
                </div>
                <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={speed}
                    onChange={(e) => handleChange('speed', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
            </div>

            <div className="space-y-2">
                <Label>捲動方向</Label>
                <Select value={direction} onValueChange={(val: string) => handleChange('direction', val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="選擇方向" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="left">向左</SelectItem>
                        <SelectItem value="right">向右</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
