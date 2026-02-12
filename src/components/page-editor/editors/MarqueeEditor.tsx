import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditorProps } from "../shared/types"
import { SpacingControls } from "../responsive-controls"

export function MarqueeEditor({ props, onChange }: EditorProps) {
    const {
        text = "WELCOME TO OUR STORE",
        speed = 30,
        direction = "left",
        pauseOnHover = true,
        backgroundColor = "#000000",
        textColor = "#FFFFFF",
        fontSize = 16,
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
                <Label>跑馬燈文字</Label>
                <Input
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('text', e.target.value)}
                    placeholder="請輸入文字..."
                />
            </div>

            <SpacingControls
                paddingY={{ desktop: paddingYDesktop, mobile: paddingYMobile }}
                onChange={(updates) => {
                    const newProps = { ...props, ...updates }
                    onChange(newProps)
                }}
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
                    <Label>字體大小 ({fontSize}px)</Label>
                </div>
                <input
                    type="range"
                    min={12}
                    max={100}
                    step={1}
                    value={fontSize}
                    onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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

            <div className="flex items-center justify-between">
                <Label htmlFor="pause-hover">懸停暫停</Label>
                <div className="flex items-center h-6">
                    <input
                        id="pause-hover"
                        type="checkbox"
                        checked={pauseOnHover}
                        onChange={(e) => handleChange('pauseOnHover', e.target.checked)}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
            </div>
        </div>
    )
}
