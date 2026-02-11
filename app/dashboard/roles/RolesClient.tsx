"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, ShieldOff, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleRoleAction } from "@/app/dashboard/roles/actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    role: string;
    createdAt: Date;
}

export function RolesClient({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleRoleChangeClick = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const confirmRoleChange = async () => {
        if (!selectedUser) return;
        setIsLoading(true);
        try {
            await toggleRoleAction(selectedUser.id, selectedUser.role);

            // Optimistic update
            const newRole = selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user role");
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
            setSelectedUser(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {filteredUsers.length} users
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground font-medium">User</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Role</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Joined</TableHead>
                            <TableHead className="text-right text-muted-foreground font-medium">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-border hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-border">
                                                <AvatarImage src={user.profileImage} />
                                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                                    {(user.firstName?.[0] || 'U').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground text-sm">{user.firstName} {user.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                capitalize border-0 px-2 py-1
                                                ${user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-700/10'
                                                    : 'bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-700/10'}
                                            `}
                                        >
                                            {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                                            {user.role || 'USER'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => handleRoleChangeClick(user)}
                                                    className="focus:bg-muted focus:text-foreground cursor-pointer"
                                                >
                                                    {user.role === 'ADMIN' ? (
                                                        <>
                                                            <ShieldOff className="mr-2 h-4 w-4 text-red-500" />
                                                            <span>Demote to User</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="mr-2 h-4 w-4 text-emerald-500" />
                                                            <span>Promote to Admin</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-border" />
                                                <DropdownMenuItem className="focus:bg-muted focus:text-foreground cursor-pointer text-muted-foreground">
                                                    View Details
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

            {/* Confirmation Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="bg-background border-border text-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change User Role?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to change
                            <span className="font-bold text-foreground mx-1">{selectedUser?.firstName}</span>
                            to
                            <span className="font-bold text-foreground mx-1">{selectedUser?.role === 'ADMIN' ? 'USER' : 'ADMIN'}</span>?
                            {selectedUser?.role !== 'ADMIN' && (
                                <p className="mt-2 text-amber-600 text-xs bg-amber-50 p-2 rounded border border-amber-200">
                                    Warning: Admins have full access to the dashboard, including revenue data and settings.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => { e.preventDefault(); confirmRoleChange(); }}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating..." : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
