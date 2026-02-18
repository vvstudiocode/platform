import React from 'react';
import type { EditorProps } from '../shared/types';
import { ImageInput } from '../image-input';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const BentoGridEditor: React.FC<EditorProps> = ({ props, onChange }) => {
    const content = props || {};

    const handleChange = (field: string, value: string) => {
        onChange({
            ...content,
            [field]: value,
        });
    };

    return (
        <div className="space-y-6">
            {/* Block 1 */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                <div className="font-medium text-sm text-gray-900">區塊 1</div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">標題</Label>
                    <Input
                        value={content.title1 || ''}
                        onChange={(e) => handleChange('title1', e.target.value)}
                        placeholder="高度客製化"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">數值文字 (預設: 100%)</Label>
                    <Input
                        value={content.value1 || ''}
                        onChange={(e) => handleChange('value1', e.target.value)}
                        placeholder="100%"
                    />
                </div>
            </div>

            {/* Block 2 */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                <div className="font-medium text-sm text-gray-900">區塊 2</div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">標題</Label>
                    <Input
                        value={content.title2 || ''}
                        onChange={(e) => handleChange('title2', e.target.value)}
                        placeholder="預設安全防護"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">更換指紋圖標 (選填)</Label>
                    <ImageInput
                        value={content.icon2 || ''}
                        onChange={(url) => handleChange('icon2', url)}
                    />
                </div>
            </div>

            {/* Block 3 */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                <div className="font-medium text-sm text-gray-900">區塊 3</div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">標題</Label>
                    <Input
                        value={content.title3 || ''}
                        onChange={(e) => handleChange('title3', e.target.value)}
                        placeholder="極速效能體驗"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">更換上方圖案 (選填)</Label>
                    <ImageInput
                        value={content.graphic3 || ''}
                        onChange={(url) => handleChange('graphic3', url)}
                    />
                </div>
            </div>

            {/* Block 4 */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                <div className="font-medium text-sm text-gray-900">區塊 4</div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">標題</Label>
                    <Input
                        value={content.title4 || ''}
                        onChange={(e) => handleChange('title4', e.target.value)}
                        placeholder="數據洞察與分析"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">更換標題圖標 (選填)</Label>
                    <ImageInput
                        value={content.icon4 || ''}
                        onChange={(url) => handleChange('icon4', url)}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">更換折線圖 (選填)</Label>
                    <ImageInput
                        value={content.chart4 || ''}
                        onChange={(url) => handleChange('chart4', url)}
                    />
                </div>
            </div>

            {/* Block 5 */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                <div className="font-medium text-sm text-gray-900">區塊 5</div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">標題</Label>
                    <Input
                        value={content.title5 || ''}
                        onChange={(e) => handleChange('title5', e.target.value)}
                        placeholder="守護您的摯愛"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">更換標題圖標 (選填)</Label>
                    <ImageInput
                        value={content.icon5 || ''}
                        onChange={(url) => handleChange('icon5', url)}
                    />
                </div>

                <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">人物 1</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <Input
                            placeholder="名字"
                            className="text-xs"
                            value={content.avatar1Name || ''}
                            onChange={(e) => handleChange('avatar1Name', e.target.value)}
                        />
                        <ImageInput
                            value={content.avatar1Image || ''}
                            onChange={(url) => handleChange('avatar1Image', url)}
                        />
                    </div>

                    <div className="text-xs font-medium text-gray-700 mb-2">人物 2</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <Input
                            placeholder="名字"
                            className="text-xs"
                            value={content.avatar2Name || ''}
                            onChange={(e) => handleChange('avatar2Name', e.target.value)}
                        />
                        <ImageInput
                            value={content.avatar2Image || ''}
                            onChange={(url) => handleChange('avatar2Image', url)}
                        />
                    </div>

                    <div className="text-xs font-medium text-gray-700 mb-2">人物 3</div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="名字"
                            className="text-xs"
                            value={content.avatar3Name || ''}
                            onChange={(e) => handleChange('avatar3Name', e.target.value)}
                        />
                        <ImageInput
                            value={content.avatar3Image || ''}
                            onChange={(url) => handleChange('avatar3Image', url)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
