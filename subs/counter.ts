import { observables, operators, map, combine, scoper, applyPipes, provide, type Subscribable } from "@submodule/core"

export type Config = {
  seed: number
  increment: number
  frequency: number
}

export const configStream = provide(() => {
  let config: Config = {
    seed: 0,
    increment: 1,
    frequency: 1000
  }

  const [configStream, changeConfig] = observables.pushObservable<Config>(config)

  const changeConfigAPI = {
    setSeed: (seed: number) => {
      config = { ...config, seed }
      changeConfig.next(config)
    },
    setIncrement: (increment: number) => {
      config = { ...config, increment }
      changeConfig.next(config)
    },
    setFrequency: (frequency: number) => {
      config = { ...config, frequency }
      changeConfig.next(config)
    }
  }

  return [configStream, changeConfigAPI] as const
})

export const counterStream = map(
  combine({ scoper, configStream }),
  ({ configStream: [observable] }): Subscribable<number> => {
    const [counterApp, counterAppSubscriber] = observables.pushObservable<number>()

    let interval: number | undefined = undefined

    const cleanup = observable
      .subscribe({
        next: ({ seed, increment, frequency }) => {
          if (interval) {
            console.log('clearing interval')
            clearInterval(interval)
          }

          interval = setInterval(() => {
            counterAppSubscriber.next(seed)
            seed += increment
          }, frequency)
        },
        error: () => {
          clearInterval(interval)
        },
        complete: () => {
          clearInterval(interval)
        }
      })

    return {
      ...counterApp,
      subscribe: (sub) => {
        const unsub = counterApp.subscribe(sub)
        return () => {
          unsub()
          cleanup()
        }
      }
    }
  })

export const onlyOddStream = applyPipes(
  counterStream,
  operators.filter(value => value % 2 === 1)
)