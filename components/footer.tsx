import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      Dinewith helps you plan memorable meals with{' '}
      <ExternalLink href="https://nextjs.org">Next.js</ExternalLink>,{' '}
      <ExternalLink href="https://sdk.vercel.ai">Vercel&nbsp;AI&nbsp;SDK</ExternalLink>
      {' '}and{' '}
      <ExternalLink href="https://vercel.com/storage/kv">Vercel&nbsp;KV</ExternalLink>
      .
    </p>
  )
}
