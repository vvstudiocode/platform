'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { MemberEditDialog } from './member-edit-dialog'

interface Member {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
    current_points: number
    total_spent: number
    orders_count: number
    created_at: string
    level?: {
        id: string
        name: string
    }
}

interface Props {
    storeId: string
}

export function MembersTable({ storeId }: Props) {
    const supabase = createClient()
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [editingMember, setEditingMember] = useState<Member | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const ITEMS_PER_PAGE = 10

    useEffect(() => {
        fetchMembers()
    }, [page, search])

    const fetchMembers = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('customers')
                .select(`
                    *,
                    level:member_levels!member_level_id(id, name)
                `, { count: 'exact' })
                .eq('tenant_id', storeId)
                .order('created_at', { ascending: false })

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
            }

            const from = (page - 1) * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, error, count } = await query.range(from, to)

            if (error) throw error

            setMembers(data as any || [])
            if (count) {
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE))
            }
        } catch (error) {
            console.error('Error fetching members:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除這位會員嗎？此動作無法復原。')) return

        try {
            const { error } = await supabase.from('customers').delete().eq('id', id)
            if (error) throw error
            fetchMembers() // Refresh
        } catch (error) {
            console.error('Delete failed:', error)
            alert('刪除失敗')
        }
    }

    const handleEdit = (member: Member) => {
        setEditingMember(member)
        setIsEditOpen(true)
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>會員名單</CardTitle>
                    <CardDescription>查看與管理商店的所有會員。</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="搜尋姓名、Email 或電話..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPage(1) // Reset to page 1 on search
                                }}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>姓名 / Email</TableHead>
                                    <TableHead>電話</TableHead>
                                    <TableHead>等級</TableHead>

                                    <TableHead className="text-right">累積消費</TableHead>
                                    <TableHead className="text-right">加入時間</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : members.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            尚無會員資料
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-sm text-muted-foreground">{member.email}</div>
                                            </TableCell>
                                            <TableCell>{member.phone || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {member.level?.name || '一般會員'}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right font-mono">
                                                ${member.total_spent.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {format(new Date(member.created_at), 'yyyy/MM/dd')}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(member)}>
                                                            <Edit className="mr-2 h-4 w-4" /> 編輯資料
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> 刪除會員
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end user-select-none space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                上一頁
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                頁次 {page} / {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                            >
                                下一頁
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <MemberEditDialog
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSuccess={() => {
                    fetchMembers()
                    // Optionally show toast
                }}
                member={editingMember}
                storeId={storeId}
            />
        </>
    )
}

