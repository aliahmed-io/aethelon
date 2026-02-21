"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LayoutDashboard, BrainCircuit } from "lucide-react";

interface DashboardNavigationProps {
  pendingContactCount?: number;
}

export function DashboardNavigation({ pendingContactCount = 0 }: DashboardNavigationProps) {
  const pathname = usePathname();

  const isGroupActive = (paths: string[]) => paths.includes(pathname);

  // Groups
  const commandCenterLinks = [
    { name: "Dashboard", href: "/store/dashboard" },
    { name: "AI COO Mode", href: "/store/dashboard/ai-coo" },
  ];

  const storeManagementLinks = [
    { name: "Orders", href: "/store/dashboard/orders" },
    { name: "Products", href: "/store/dashboard/products" },
    { name: "Categories", href: "/store/dashboard/categories" },
    { name: "Banner Picture", href: "/store/dashboard/banner" },
    { name: "Returns", href: "/store/dashboard/returns" },
  ];

  const communicationLinks = [
    { name: "Email", href: "/store/dashboard/email" },
    { name: "Contact", href: "/store/dashboard/contact", count: pendingContactCount },
  ];

  const systemLinks = [
    { name: "System Health", href: "/store/dashboard/integrations" },
    { name: "Audit Logs", href: "/store/dashboard/audit" },
    { name: "Security Alerts", href: "/store/dashboard/alerts" },
  ];

  const communicationHasNotification = pendingContactCount > 0;

  return (
    <div className="flex items-center gap-4 lg:gap-6">

      {/* Command Center (Bundled Dashboard + COO) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-auto py-1 px-2 text-sm font-medium hover:bg-transparent -ml-2 transition-colors",
              isGroupActive(commandCenterLinks.map(l => l.href))
                ? "text-primary bg-primary/10" // "Bluish" highlight for active parent
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Command Center
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          <DropdownMenuLabel>Executive Overview</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {commandCenterLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} className="w-full cursor-pointer flex items-center gap-2">
                {link.name === "AI COO Mode" && <BrainCircuit className="h-4 w-4 text-indigo-500" />}
                {link.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-[1px] bg-border mx-2" />

      {/* Store Management */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-auto py-1 px-2 text-sm font-medium hover:bg-transparent -ml-2",
              isGroupActive(storeManagementLinks.map(l => l.href)) ? "text-primary" : "text-muted-foreground"
            )}
          >
            Store Management
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Manage Store</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {storeManagementLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} className="w-full cursor-pointer">
                {link.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Communication */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-auto py-1 px-2 text-sm font-medium hover:bg-transparent -ml-2 relative",
              isGroupActive(communicationLinks.map(l => l.href)) ? "text-primary" : "text-muted-foreground"
            )}
          >
            Communication
            {communicationHasNotification && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Messages</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {communicationLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} className="w-full cursor-pointer flex justify-between items-center bg-white">
                {link.name}
                {link.count !== undefined && link.count > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.count}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* System & Security */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-auto py-1 px-2 text-sm font-medium hover:bg-transparent -ml-2",
              isGroupActive(systemLinks.map(l => l.href)) ? "text-primary" : "text-muted-foreground"
            )}
          >
            System & Security
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {systemLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} className="w-full cursor-pointer">
                {link.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
