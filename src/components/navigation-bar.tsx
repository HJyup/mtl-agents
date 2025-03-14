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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const NavigationBar = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const linkButtons = [
    { href: LINKS.LINKEDIN, Icon: LinkedinIcon },
    { href: LINKS.GITHUB, Icon: GithubIcon },
    { href: LINKS.MAIL, Icon: MailIcon }
  ];

  return (
    <nav className="flex justify-between items-center fixed top-0 w-full px-6 py-2 bg-background/80 backdrop-blur-md border-white/10 z-10">
      <a
        href="https://danyilbutov.com"
        className="text-xs md:text-sm font-bold hover:underline"
      >
        danyilbutov<span className="text-muted-foreground">.com</span>
      </a>
      <div className="flex gap-1 md:gap-2 items-center">
        {linkButtons.map(({ Icon }, index) =>
          <Button key={index} size="icon" variant="ghost">
            <Icon className="dark:text-muted-foreground" size={16} />
          </Button>
        )}
        
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 ml-10 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
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
