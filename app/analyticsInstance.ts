import { Analytics } from '@segment/analytics-node'

type AnalyticsClient = Pick<
  Analytics,
  'track' | 'identify' | 'group' | 'page' | 'screen' | 'alias' | 'flush'
>

const createNoopAnalytics = (): AnalyticsClient => {
  const noop = async () => {}

  if (process.env.NODE_ENV !== 'production') {
    console.warn('Segment write key not configured. Analytics disabled.')
  }

  return {
    track: noop,
    identify: noop,
    group: noop,
    page: noop,
    screen: noop,
    alias: noop,
    flush: noop,
  }
}

const analyticsSingleton = (): AnalyticsClient => {
  const writeKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY

  if (!writeKey) {
    return createNoopAnalytics()
  }

  return new Analytics({ writeKey })
}

declare global {
  // eslint-disable-next-line no-var
  var analyticsGlobal: AnalyticsClient | undefined
}

const analytics = globalThis.analyticsGlobal ?? analyticsSingleton()

export default analytics

if (process.env.NODE_ENV !== 'production') {
  globalThis.analyticsGlobal = analytics
}
