'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Member {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
    current_points: number
    level?: {
        id: string
        name: string
    }
    member_level_id?: string
}

interface MemberLevel {
    id: string
    name: string
}

interface Props {
    member: Member | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    storeId: string
}

export function MemberEditDialog({ member, isOpen, onClose, onSuccess, storeId }: Props) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [levels, setLevels] = useState<MemberLevel[]>([])

    // Form State
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [levelId, setLevelId] = useState<string>('none')

    useEffect(() => {
        if (isOpen) {
            fetchLevels()
            if (member) {
                setName(member.name || '')
                setPhone(member.phone || '')
                setAddress(member.address || '')
                setLevelId(member.member_level_id || member.level?.id || 'none')
            }
        }
    }, [isOpen, member])

    const fetchLevels = async () => {
        const { data } = await supabase
            .from('member_levels')
            .select('id, name')
            .eq('tenant_id', storeId)
            .order('min_spend', { ascending: true })

        if (data) setLevels(data)
    }

    const handleSave = async () => {
        if (!member) return
        setLoading(true)

        try {
            const updateData: any = {
                name,
                phone,
                address,
                member_level_id: levelId === 'none' ? null : levelId
            }

            const { error } = await supabase
                .from('customers')
                .update(updateData)
                .eq('id', member.id)

            if (error) throw error

            onSuccess()
            onClose()
        } catch (error) {
            console.error('Update failed:', error)
            alert('更新失敗')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>編輯會員資料</DialogTitle>
                    <DialogDescription>
                        修改會員的基本資料與等級。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={member?.email} disabled className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">姓名</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">電話</Label>
                        <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">地址</Label>
                        <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>會員等級</Label>
                        <Select value={levelId} onValueChange={setLevelId}>
                            <SelectTrigger>
                                <SelectValue placeholder="選擇等級" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">無 (一般會員)</SelectItem>
                                {levels.map(l => (
                                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>取消</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        儲存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
