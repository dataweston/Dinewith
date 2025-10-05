import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { IconGitHub, IconSeparator, IconUtensils } from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import { Session } from '@/lib/types'

async function UserOrLogin() {
  const session = (await auth()) as Session
  return (
    <>
      <Link
        href="/"
        rel="nofollow"
        className="flex items-center gap-2 text-base font-semibold"
      >
        <IconUtensils className="size-6 text-primary" />
        <span className="hidden sm:inline">Dinewith</span>
      </Link>
      {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
          <SidebarToggle />
          <div className="flex items-center">
            <IconSeparator className="size-6 text-muted-foreground/50" />
            <UserMenu user={session.user} />
          </div>
        </>
      ) : (
        <div className="flex items-center">
          <IconSeparator className="size-6 text-muted-foreground/50" />
          <Button variant="link" asChild className="-ml-2">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      )}
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/vercel/ai"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>
      </div>
    </header>
  )
}
