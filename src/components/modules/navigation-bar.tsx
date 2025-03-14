"use client";

import { GithubIcon, LinkedinIcon, MailIcon, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { LINKS } from "@/const/links";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LinkButton {
  href: string;
  Icon: React.ElementType;
  label: string;
}

const NavigationBar = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const linkButtons: LinkButton[] = [
    { href: LINKS.LINKEDIN, Icon: LinkedinIcon, label: "LinkedIn Profile" },
    { href: LINKS.GITHUB, Icon: GithubIcon, label: "GitHub Profile" },
    { href: LINKS.MAIL, Icon: MailIcon, label: "Email Contact" },
  ];

  return (
    <nav className="bg-background/80 fixed top-0 z-10 flex w-full items-center justify-between border-white/10 px-6 py-2 backdrop-blur-md">
      <a
        href="https://danyilbutov.com"
        className="text-xs font-bold transition-colors hover:underline md:text-sm"
      >
        danyilbutov<span className="text-muted-foreground">.com</span>
      </a>
      <div className="flex items-center gap-2">
        {linkButtons.map(({ href, Icon, label }) => (
          <Button
            key={href}
            size="icon"
            variant="ghost"
            asChild
            className="hover:bg-muted transition-colors"
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <Icon className="dark:text-muted-foreground" size={16} />
            </a>
          </Button>
        ))}

        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hover:bg-muted relative ml-4 h-8 w-8 rounded-full transition-colors"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={session.user?.image ?? ""}
                    alt={session.user?.name ?? "User avatar"}
                  />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm leading-none font-medium">
                    {session.user?.name}
                  </p>
                  <p className="text-muted-foreground text-xs leading-none">
                    {session.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="hover:bg-muted cursor-pointer transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
