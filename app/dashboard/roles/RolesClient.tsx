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
import { toggleRoleAction } from "@/app/dashboard/roles/actions"; // We'll create this
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

            // toast.success(`User ${selectedUser.firstName} is now a ${newRole}`); 
        } catch (error) {
            console.error(error);
            // toast.error("Failed to update role");
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
            setSelectedUser(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#050505]/40 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-sm text-white/40">
                    Showing {filteredUsers.length} users
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-white/10 bg-[#050505]/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/40 font-medium">User</TableHead>
                            <TableHead className="text-white/40 font-medium">Role</TableHead>
                            <TableHead className="text-white/40 font-medium">Joined</TableHead>
                            <TableHead className="text-right text-white/40 font-medium">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-white/40">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-white/10">
                                                <AvatarImage src={user.profileImage} />
                                                <AvatarFallback className="bg-white/10 text-white/60 text-xs">
                                                    {(user.firstName?.[0] || 'U').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white text-sm">{user.firstName} {user.lastName}</span>
                                                <span className="text-xs text-white/40">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                capitalize border-0 px-2 py-1
                                                ${user.role === 'ADMIN'
                                                    ? 'bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-500/20'
                                                    : 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20'}
                                            `}
                                        >
                                            {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                                            {user.role || 'USER'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-white/40 text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#0A0A0C] border-white/10 text-white">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => handleRoleChangeClick(user)}
                                                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                                                >
                                                    {user.role === 'ADMIN' ? (
                                                        <>
                                                            <ShieldOff className="mr-2 h-4 w-4 text-red-400" />
                                                            <span>Demote to User</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="mr-2 h-4 w-4 text-emerald-400" />
                                                            <span>Promote to Admin</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer text-white/50">
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
                <AlertDialogContent className="bg-[#0A0A0C] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change User Role?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            Are you sure you want to change
                            <span className="font-bold text-white mx-1">{selectedUser?.firstName}</span>
                            to
                            <span className="font-bold text-white mx-1">{selectedUser?.role === 'ADMIN' ? 'USER' : 'ADMIN'}</span>?
                            {selectedUser?.role !== 'ADMIN' && (
                                <p className="mt-2 text-amber-500 text-xs bg-amber-500/10 p-2 rounded">
                                    Warning: Admins have full access to the dashboard, including revenue data and settings.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => { e.preventDefault(); confirmRoleChange(); }}
                            className="bg-white text-black hover:bg-white/90"
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
