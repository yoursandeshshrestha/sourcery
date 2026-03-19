import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Users, Search, Shield, UserCheck, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/date';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'INVESTOR' | 'SOURCER' | 'ADMIN';
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELLED' | null;
  created_at: string;
}

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(() => {
    return searchParams.get('role') || 'all';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<'INVESTOR' | 'SOURCER' | 'ADMIN' | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 20;

  // Sync all filters from URL params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');

    setRoleFilter(roleParam || 'all');
    setSearchQuery(searchParam || '');
    setCurrentPage(pageParam ? parseInt(pageParam, 10) : 1);
  }, [searchParams]);

  // Set initial URL params if not present
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let updated = false;

    if (!searchParams.has('role')) {
      params.set('role', 'all');
      updated = true;
    }
    if (!searchParams.has('search')) {
      params.set('search', '');
      updated = true;
    }
    if (!searchParams.has('page')) {
      params.set('page', '1');
      updated = true;
    }

    if (updated) {
      setSearchParams(params, { replace: true });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, searchQuery, roleFilter]);

  const fetchStats = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Apply filters
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { count, error } = await query;

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching stats:', error);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, verification_status, created_at');

      // Apply filters
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching users:', error);
      }
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: Profile, role: 'INVESTOR' | 'SOURCER' | 'ADMIN') => {
    setSelectedUser(user);
    setNewRole(role);
    setDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setUpdatingUserId(selectedUser.id);

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success(
        `${selectedUser.first_name} ${selectedUser.last_name}'s role changed to ${newRole}`
      );

      // Refresh the list
      await fetchUsers();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating user role:', error);
      }
      toast.error('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
      setDialogOpen(false);
      setSelectedUser(null);
      setNewRole(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge className="bg-purple-500/10 text-purple-700 border-purple-200 hover:bg-purple-500/20">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case 'SOURCER':
        return (
          <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20">
            <UserCheck className="h-3 w-3 mr-1" />
            Sourcer
          </Badge>
        );
      case 'INVESTOR':
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20">
            <User className="h-3 w-3 mr-1" />
            Investor
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return <span className="text-sm text-muted-foreground">—</span>;
    }

    const variants: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20' },
      VERIFIED: { label: 'Verified', className: 'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20' },
      REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20' },
      CANCELLED: { label: 'Cancelled', className: 'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/20' },
    };

    const config = variants[status];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions ({totalCount} {totalCount === 1 ? 'user' : 'users'})
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              setCurrentPage(1);

              // Update URL
              const params = new URLSearchParams(searchParams);
              params.set('search', value);
              params.set('page', '1');
              setSearchParams(params);
            }}
            className="pl-9 rounded-lg"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value);
            setCurrentPage(1);

            // Update URL
            const params = new URLSearchParams(searchParams);
            params.set('role', value);
            params.set('page', '1');
            setSearchParams(params);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] cursor-pointer rounded-lg">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                All Roles
              </div>
            </SelectItem>
            <SelectItem value="INVESTOR" className="cursor-pointer">
              <div className="flex items-center">
                <User className="h-3.5 w-3.5 mr-2 text-green-600" />
                Investors
              </div>
            </SelectItem>
            <SelectItem value="SOURCER" className="cursor-pointer">
              <div className="flex items-center">
                <UserCheck className="h-3.5 w-3.5 mr-2 text-blue-600" />
                Sourcers
              </div>
            </SelectItem>
            <SelectItem value="ADMIN" className="cursor-pointer">
              <div className="flex items-center">
                <Shield className="h-3.5 w-3.5 mr-2 text-purple-600" />
                Admins
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {(searchQuery || roleFilter !== 'all') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('all');
              setCurrentPage(1);

              // Reset URL params to defaults
              const params = new URLSearchParams();
              params.set('role', 'all');
              params.set('search', '');
              params.set('page', '1');
              setSearchParams(params);
            }}
            className="cursor-pointer whitespace-nowrap rounded-lg"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Users Table */}
      <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.verification_status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user, value as 'INVESTOR' | 'SOURCER' | 'ADMIN')
                        }
                        disabled={updatingUserId === user.id}
                      >
                        <SelectTrigger className="w-[150px] ml-auto cursor-pointer rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INVESTOR" className="cursor-pointer">
                            <div className="flex items-center">
                              <User className="h-3.5 w-3.5 mr-2 text-green-600" />
                              Investor
                            </div>
                          </SelectItem>
                          <SelectItem value="SOURCER" className="cursor-pointer">
                            <div className="flex items-center">
                              <UserCheck className="h-3.5 w-3.5 mr-2 text-blue-600" />
                              Sourcer
                            </div>
                          </SelectItem>
                          <SelectItem value="ADMIN" className="cursor-pointer">
                            <div className="flex items-center">
                              <Shield className="h-3.5 w-3.5 mr-2 text-purple-600" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      {/* Pagination */}
      {totalCount > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-muted-foreground">
            Showing {totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);

                // Update URL
                const params = new URLSearchParams(searchParams);
                params.set('page', newPage.toString());
                setSearchParams(params);
              }}
              disabled={currentPage === 1}
              className="cursor-pointer rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), currentPage + 1);
                setCurrentPage(newPage);

                // Update URL
                const params = new URLSearchParams(searchParams);
                params.set('page', newPage.toString());
                setSearchParams(params);
              }}
              disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE)}
              className="cursor-pointer rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change{' '}
              <span className="font-medium">
                {selectedUser?.first_name} {selectedUser?.last_name}
              </span>
              's role from <span className="font-medium">{selectedUser?.role}</span> to{' '}
              <span className="font-medium">{newRole}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} className="cursor-pointer rounded-lg">
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
