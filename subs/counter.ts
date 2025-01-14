import { observables, operators, map, combine, scoper, applyPipes, provide } from "@submodule/core"

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
  ({ scoper, configStream: [observable] }) => {
    const [counterApp, counterAppSubscriber] = observables.pushObservable<number>()

    let interval: number | undefined = undefined

    const cleanup = observable
      .subscribe({
        next: ({ seed, increment, frequency }) => {
          if (interval) {
            clearTimeout(interval)
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

    scoper.addDefer(() => {
      clearTimeout(interval)
      cleanup()
    })

    return counterApp
  })

export const onlyOddStream = applyPipes(
  counterStream,
  operators.filter(value => value % 2 === 1)
)