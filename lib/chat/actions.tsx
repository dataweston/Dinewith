import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  render,
  createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Matches,
  Restaurant,
  Itinerary,
  Booking,
  UserMessage,
  SpinnerMessage
} from '@/components/dining'
import { MatchesSkeleton } from '@/components/dining/matches-skeleton'
import { RestaurantSkeleton } from '@/components/dining/restaurant-skeleton'
import { ItinerarySkeleton } from '@/components/dining/itinerary-skeleton'
import { z } from 'zod'
import { runAsyncFnWithoutBlocking, sleep, nanoid } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { Chat } from '@/lib/types'
import { auth } from '@/auth'
import analytics from '@/app/analyticsInstance'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

async function confirmReservation(
  restaurant: string,
  date: string,
  time: string,
  partySize: number
) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const reservation = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Checking {restaurant} for {partySize} guests...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1200)

    reservation.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">Coordinating with the host team…</p>
      </div>
    )

    await sleep(1200)

    reservation.done(
      <div>
        <p className="mb-2 font-medium text-foreground">
          {restaurant} is ready for {partySize} guests at {time}.
        </p>
        <p className="text-sm text-muted-foreground">
          A confirmation email is on its way with arrival details.
        </p>
      </div>
    )

    analytics.track({
      userId: '123',
      event: 'Reservation Confirmed',
      properties: {
        restaurant,
        date,
        time,
        partySize,
        conversationId: aiState.get().chatId
      }
    })

    systemMessage.done(
      <SystemMessage>
        Reservation confirmed for {partySize} guests at {restaurant} on {date} at {time}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages.slice(0, -1),
        {
          id: nanoid(),
          role: 'function',
          name: 'showBookingOptions',
          content: JSON.stringify({
            restaurant,
            date,
            time,
            partySize,
            status: 'confirmed'
          })
        },
        {
          id: nanoid(),
          role: 'system',
          content: `[Reservation confirmed for ${partySize} guests at ${restaurant} on ${date} at ${time}]`
        }
      ]
    })
  })

  return {
    bookingUI: reservation.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream:
    | undefined
    | ReturnType<typeof createStreamableValue<string>>
  let textNode: React.ReactNode | undefined

  const ui = render({
    model: 'gpt-3.5-turbo',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: `\
You are Dinewith, an AI dining concierge that helps hosts curate memorable shared meals.
Partner with the host to match compatible guests, recommend restaurants, outline the evening's agenda, and manage reservations.

Messages inside [] describe UI elements or host interactions. For example:
- "[Reservation confirmed for 4 guests at Lilia]" means the booking component was updated with a confirmation.
- "[Host adjusted the party size to 6 guests for Lilia]" reflects a change made in the reservation UI.

Use the provided tools when appropriate:
- Call \`suggestGuestMatches\` to present a set of potential dining partners.
- Call \`showRestaurantDetails\` to highlight a venue or menu option.
- Call \`showBookingOptions\` when the host wants to review or confirm a table.
- Call \`outlineDiningAgenda\` to summarize the flow of the evening.

If the host asks for something unrelated to planning a dining experience, respond with a gentle limitation while offering to assist with the meal instead.`
      },
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      // Capture the assistant response for analytics tooling
      if (done) {
        analytics.track({
          userId: '123',
          event: 'Plan Update Delivered',
          properties: {
            content,
            conversationId: aiState.get().chatId
          }
        })

        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    functions: {
      suggestGuestMatches: {
        description:
          'Surface potential dining partners with complementary interests and availability.',
        parameters: z.object({
          partners: z.array(
            z.object({
              name: z.string().describe('Name of the potential guest.'),
              tagline: z.string().describe('Short descriptor or profession to introduce them.'),
              interests: z
                .array(z.string())
                .describe('Shared interests or talking points they bring to the table.'),
              availability: z
                .string()
                .describe('When this guest is available to join the meal.'),
              dietaryNotes: z
                .string()
                .optional()
                .describe('Optional dietary or accessibility notes to highlight.')
            })
          )
        }),
        render: async function* ({ partners }) {
          yield (
            <BotCard>
              <MatchesSkeleton />
            </BotCard>
          )

          analytics.track({
            userId: '123',
            event: 'Component Loaded',
            properties: {
              type: 'Guest Matches',
              conversationId: aiState.get().chatId,
              guests: JSON.stringify(partners)
            }
          })

          await sleep(800)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'suggestGuestMatches',
                content: JSON.stringify(partners)
              }
            ]
          })

          return (
            <BotCard>
              <Matches props={partners} />
            </BotCard>
          )
        }
      },
      showRestaurantDetails: {
        description: 'Present a recommended restaurant or venue with relevant highlights.',
        parameters: z.object({
          name: z.string().describe('Restaurant name.'),
          cuisine: z.string().describe('Cuisine or concept.'),
          neighborhood: z.string().describe('Neighborhood or area.'),
          highlights: z
            .array(z.string())
            .describe('Reasons this venue fits the group or notable experiences.'),
          priceRange: z.string().describe('Budget indicator such as $$ or $$$.'),
          address: z.string().optional().describe('Optional street address or location detail.'),
          contact: z
            .string()
            .optional()
            .describe('Optional contact information or reservation link.')
        }),
        render: async function* (details) {
          yield (
            <BotCard>
              <RestaurantSkeleton />
            </BotCard>
          )

          analytics.track({
            userId: '123',
            event: 'Component Loaded',
            properties: {
              type: 'Restaurant Recommendation',
              restaurant: details.name,
              conversationId: aiState.get().chatId
            }
          })

          await sleep(800)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showRestaurantDetails',
                content: JSON.stringify(details)
              }
            ]
          })

          return (
            <BotCard>
              <Restaurant props={details} />
            </BotCard>
          )
        }
      },
      showBookingOptions: {
        description: 'Display reservation details and allow the host to confirm a table.',
        parameters: z.object({
          restaurant: z.string().describe('Restaurant name for the reservation.'),
          date: z.string().describe('Date of the seating, e.g. Friday, May 12.'),
          time: z.string().describe('Time of the reservation.'),
          partySize: z
            .number()
            .describe('Number of guests that should be accommodated.'),
          notes: z
            .string()
            .optional()
            .describe('Optional notes or host considerations to surface.'),
          status: z
            .enum(['requires_action', 'confirmed', 'expired'])
            .optional()
            .describe('The current state of the reservation flow.')
        }),
        render: async function* ({
          restaurant,
          date,
          time,
          partySize,
          notes,
          status = 'requires_action'
        }) {
          yield (
            <BotCard>
              <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                Gathering availability from the host…
              </div>
            </BotCard>
          )

          analytics.track({
            userId: '123',
            event: 'Component Loaded',
            properties: {
              type: 'Reservation Options',
              restaurant,
              partySize,
              conversationId: aiState.get().chatId
            }
          })

          await sleep(600)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showBookingOptions',
                content: JSON.stringify({
                  restaurant,
                  date,
                  time,
                  partySize,
                  notes,
                  status
                })
              }
            ]
          })

          return (
            <BotCard>
              <Booking
                props={{
                  restaurant,
                  date,
                  time,
                  partySize,
                  notes,
                  status
                }}
              />
            </BotCard>
          )
        }
      },
      outlineDiningAgenda: {
        description: 'Summarize the flow of the evening so the host can share next steps.',
        parameters: z.object({
          title: z.string().describe('Title or theme for the gathering.'),
          date: z.string().describe('Date for the dinner.'),
          agenda: z.array(
            z.object({
              time: z.string().describe('Time marker for the moment.'),
              description: z.string().describe('Description of what happens.'),
              hostNotes: z
                .string()
                .optional()
                .describe('Optional reminder for the host or guests.')
            })
          ),
          tips: z.string().optional().describe('Optional hosting tip to emphasize at the end.')
        }),
        render: async function* (agenda) {
          yield (
            <BotCard>
              <ItinerarySkeleton />
            </BotCard>
          )

          await sleep(800)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'outlineDiningAgenda',
                content: JSON.stringify(agenda)
              }
            ]
          })

          return (
            <BotCard>
              <Itinerary props={agenda} />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: ui
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id?: string
  name?: string
}

export type AIState = {
  chatId: string
  messages: {
    role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
    content: string
    id: string
    name?: string
  }[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmReservation
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'function' ? (
          message.name === 'suggestGuestMatches' ? (
            <BotCard>
              <Matches props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showRestaurantDetails' ? (
            <BotCard>
              <Restaurant props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showBookingOptions' ? (
            <BotCard>
              <Booking props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'outlineDiningAgenda' ? (
            <BotCard>
              <Itinerary props={JSON.parse(message.content)} />
            </BotCard>
          ) : null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
