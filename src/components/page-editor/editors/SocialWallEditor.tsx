
import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react'
import type { EditorProps } from '../shared/types'
import { SpacingControls } from '../responsive-controls'

export function SocialWallEditor({ props, onChange }: EditorProps) {
    const handlePostChange = (index: number, field: string, value: any) => {
        const newPosts = [...(props.posts || [])]
        newPosts[index] = { ...newPosts[index], [field]: value }
        onChange({ posts: newPosts })
    }

    const addPost = () => {
        const newPost = {
            id: crypto.randomUUID(),
            type: 'image',
            url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
            username: '@user_name',
            caption: 'Beautiful moment captured #lifestyle #fashion',
            likes: 120
        }
        onChange({ posts: [...(props.posts || []), newPost] })
    }

    const removePost = (index: number) => {
        const newPosts = [...(props.posts || [])]
        newPosts.splice(index, 1)
        onChange({ posts: newPosts })
    }

    return (
        <div className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
                <div>
                    <Label>標題 (Title)</Label>
                    <Input
                        value={props.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                    />
                </div>
                <div>
                    <Label>副標題 (Subtitle)</Label>
                    <Input
                        value={props.subtitle || ''}
                        onChange={(e) => onChange({ subtitle: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>按鈕文字</Label>
                        <Input
                            value={props.followButtonText || ''}
                            onChange={(e) => onChange({ followButtonText: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>帳號名稱 (@Username)</Label>
                        <Input
                            value={props.username || ''}
                            onChange={(e) => onChange({ username: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <Label>連結網址 (Profile URL)</Label>
                    <Input
                        value={props.profileUrl || ''}
                        onChange={(e) => onChange({ profileUrl: e.target.value })}
                    />
                </div>
            </div>

            {/* Style Settings */}
            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-sm">樣式設定</h4>

                {/* Font Size Control - Styled like SpacingControls */}
                <div className="space-y-2 bg-muted/50 p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                字體大小
                            </Label>
                            <span className="text-[10px] px-1.5 py-0.5 bg-background rounded border border-border text-muted-foreground min-w-[3rem] text-center">
                                {props.fontSize || 16}px
                            </span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="12"
                        max="32"
                        step="1"
                        value={props.fontSize || 16}
                        onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                    />
                </div>

                {/* Padding Controls using existing component */}
                <SpacingControls
                    paddingY={{
                        desktop: props.paddingYDesktop ?? 100,
                        mobile: props.paddingYMobile ?? 60
                    }}
                    onChange={onChange}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>背景顏色</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                type="color"
                                value={props.backgroundColor || '#FFFDF7'}
                                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                className="w-8 h-8 p-0 border-0"
                            />
                            <Input
                                value={props.backgroundColor || '#FFFDF7'}
                                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>文字顏色</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                type="color"
                                value={props.textColor || '#333333'}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                                className="w-8 h-8 p-0 border-0"
                            />
                            <Input
                                value={props.textColor || '#333333'}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">社群貼文 ({props.posts?.length || 0})</h4>
                    <Button variant="outline" size="sm" onClick={addPost}>
                        <Plus className="w-4 h-4 mr-2" /> 新增貼文
                    </Button>
                </div>

                <div className="space-y-3">
                    {(props.posts || []).map((post: any, index: number) => (
                        <div key={post.id || index} className="group border rounded-lg p-3 bg-white space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-2 text-gray-400 cursor-grab">
                                    <GripVertical className="w-4 h-4" />
                                </div>

                                {/* Image Preview */}
                                <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {post.url ? (
                                        <img src={post.url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 m-auto text-gray-400" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <Input
                                        placeholder="圖片連結 URL"
                                        value={post.url || ''}
                                        onChange={(e) => handlePostChange(index, 'url', e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="@帳號"
                                            value={post.username || ''}
                                            onChange={(e) => handlePostChange(index, 'username', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">★ 數</span>
                                            <Input
                                                type="number"
                                                placeholder="Likes"
                                                value={post.likes}
                                                onChange={(e) => handlePostChange(index, 'likes', e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="內文"
                                        value={post.caption || ''}
                                        onChange={(e) => handlePostChange(index, 'caption', e.target.value)}
                                        className="min-h-[80px] text-sm"
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => removePost(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
