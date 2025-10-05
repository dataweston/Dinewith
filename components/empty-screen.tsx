import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">Welcome to Dinewith</h1>
        <p className="leading-normal text-muted-foreground">
          Dinewith pairs you with ideal dining companions, recommends venues, and
          captures every plan in a single, shareable conversation. Built with{' '}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink>, the{' '}
          <ExternalLink href="https://sdk.vercel.ai">Vercel AI SDK</ExternalLink>,
          {' '}and streaming UI primitives for real-time collaboration.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can ask for help matching guests, curating menus, or booking the
          perfect table. Try prompts like:<br></br>
          &ldquo;Suggest a vegetarian-friendly dinner spot in Brooklyn this
          Saturday.&rdquo;<br></br>
          &ldquo;Find two guests who love natural wine and design and confirm
          a table for four at 7pm.&rdquo;
        </p>
      </div>
    </div>
  )
}
