'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'
import { userService } from '@/services/user.service'
import type { User } from '@/types/user'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await userService.getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      toast.error('Kullanıcılar yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await userService.updateUser(userId, { role: newRole })
      toast.success('Kullanıcı rolü güncellendi.')
      loadUsers()
    } catch (error) {
      toast.error('Rol güncellenirken bir hata oluştu.')
    }
  }

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await userService.updateUser(userId, { isActive })
      toast.success(`Kullanıcı ${isActive ? 'aktif' : 'pasif'} duruma getirildi.`)
      loadUsers()
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu.')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h2>
        <p className="text-muted-foreground">
          Tüm kullanıcıları görüntüleyin ve yönetin.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="İsim veya e-posta ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={setRoleFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rol seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="user">Kullanıcı</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={user.role}
                    onValueChange={(value: 'user' | 'admin') => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Kullanıcı</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={(isActive) => handleStatusChange(user.id, isActive)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.location.href = `/admin/users/${user.id}`}
                  >
                    <Icons.settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Kullanıcı bulunamadı.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 