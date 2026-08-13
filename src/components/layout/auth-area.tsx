"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  ScrollText,
  User as UserIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/shared/notification-bell";
import {
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown";

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; role?: string };
}

export function AuthArea() {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser((data.user as AuthUser | null) ?? null);
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser((session?.user as AuthUser | null) ?? null);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [configured]);

  if (loading) {
    return <Skeleton className="h-9 w-28 rounded-full" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-1">
        <NotificationBell />
        <UserMenu user={user} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>
        Sign in
      </Link>
      <Link
        href="/register"
        className={buttonStyles({ variant: "primary", size: "sm" })}
      >
        Get started
      </Link>
    </div>
  );
}

function UserMenu({ user }: { user: AuthUser }) {
  const router = useRouter();
  const name = user.user_metadata?.full_name || user.email || "User";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu
      trigger={() => (
        <button
          type="button"
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
          aria-label="Open account menu"
        >
          <Avatar name={name} size="sm" />
          <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-700 sm:block">
            {name}
          </span>
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
            {user.email && (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            )}
          </div>
          <DropdownSeparator />
          <DropdownItem
            icon={<LayoutDashboard className="h-4 w-4" />}
            onSelect={() => {
              close();
              router.push("/dashboard");
            }}
          >
            Dashboard
          </DropdownItem>
          <DropdownItem
            icon={<UserIcon className="h-4 w-4" />}
            onSelect={() => {
              close();
              router.push("/profile");
            }}
          >
            Profile
          </DropdownItem>
          <DropdownItem
            icon={<ScrollText className="h-4 w-4" />}
            onSelect={() => {
              close();
              router.push("/dashboard/tuitions");
            }}
          >
            My tuitions
          </DropdownItem>
          <DropdownItem
            icon={<Heart className="h-4 w-4" />}
            onSelect={() => {
              close();
              router.push("/dashboard/favorites");
            }}
          >
            Saved teachers
          </DropdownItem>
          <DropdownItem
            icon={<Bell className="h-4 w-4" />}
            onSelect={() => {
              close();
              router.push("/dashboard/notifications");
            }}
          >
            Notifications
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            icon={<LogOut className="h-4 w-4" />}
            danger
            onSelect={() => {
              close();
              void handleSignOut();
            }}
          >
            Sign out
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
}
