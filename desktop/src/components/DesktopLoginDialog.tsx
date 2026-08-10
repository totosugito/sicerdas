import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useLoginMutation } from "@/api/auth/login";
import { useAppTranslation } from "@/lib/i18n-typed";
import { LogIn, LogOut, User, Loader2, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient } from "@/lib/auth-client";

export function DesktopLoginDialog() {
  const { t } = useAppTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    logout();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    loginMutation.mutate(
      { body: formData },
      {
        onSuccess: (res) => {
          if (res.success) {
            setOpen(false);
            setEmail("");
            setPassword("");
          } else {
            setError(res.message || "Login failed");
          }
        },
        onError: (err: any) => {
          setError(err?.message || "Invalid credentials or backend unreachable");
        },
      }
    );
  };

  if (isAuthenticated && user?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 px-2">
            <User className="h-3.5 w-3.5 text-primary" />
            <span className="max-w-[120px] truncate font-medium">
              {user.user.name || user.user.email}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold leading-none">{user.user.name}</p>
                <p className="text-[11px] leading-none text-muted-foreground">{user.user.email}</p>
                {user.user.role && (
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded w-fit mt-1">
                    {user.user.role.toUpperCase()}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            onSelect={handleLogout}
            className="text-destructive gap-2 cursor-pointer text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 text-xs gap-1.5 px-2 font-medium transition-colors cursor-pointer select-none">
        <LogIn className="h-3.5 w-3.5" />
        Login Admin
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-primary" />
            Admin Login
          </DialogTitle>
          <DialogDescription>
            Sign in to your account to export questions and access admin APIs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="desktop-email" className="text-xs">
              Email Address
            </Label>
            <Input
              id="desktop-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desktop-password" className="text-xs">
              Password
            </Label>
            <Input
              id="desktop-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-8 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loginMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loginMutation.isPending} className="gap-1.5">
              {loginMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Sign In
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
