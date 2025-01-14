import { Suspense, useMemo } from "react";
import {
	ScopeProvider,
	useObservable,
	useObservableValue,
	usePushObservable,
	useResolve,
} from "@submodule/core/react";
import {
	type Config,
	configStream,
	counterStream,
	onlyOddStream,
} from "../subs/counter";

import { modalStream } from "../subs/modals";
import { operators } from "@submodule/core";

export default function App() {
	return (
		<>
			<ScopeProvider>
				<Suspense>
					<Counter />
					<OffTree />
				</Suspense>
				<Suspense>
					<ShowConfig />
				</Suspense>
			</ScopeProvider>
		</>
	);
}

const ShowConfig = () => {
	return (
		<>
			<Seed />
			<ChangeConfig />
			<CurrentConfig />
		</>
	);
};

const Seed = () => {
	const [config] = useResolve(configStream);
	const onlySeed = useMemo(() => {
		return operators.map((input: Config) => input.seed);
	}, []);

	const seedStream = useObservableValue(config, onlySeed);

	if (!seedStream.hasValue) return null;
	return seedStream.value;
};

const CurrentConfig = () => {
	const [configObservable] = useResolve(configStream);
	const config = useObservableValue(configObservable);
	const [, changeModal] = useResolve(modalStream);

	if (!config.hasValue) {
		return null;
	}

	return (
		<div>
			<div>Seed: {config.value.seed}</div>
			<div>Increment: {config.value.increment}</div>
			<div>Frequency: {config.value.frequency}</div>
			<div>
				<button type="button" onClick={() => changeModal.next("edit")}>
					Change
				</button>
			</div>
		</div>
	);
};

const ChangeConfig = () => {
	const [configObservable, controller] = useResolve(configStream);
	const config = useObservableValue(configObservable);

	const [viewState, changeModal] = usePushObservable(modalStream);

	if (!viewState.hasValue || !config.hasValue) {
		return null;
	}

	if (viewState.value !== "edit") {
		return null;
	}

	return (
		<div>
			<label htmlFor="seedInput">Seed</label>
			<input
				id="seedInput"
				type="number"
				value={config.value.seed}
				onChange={(e) => controller.setSeed(Number.parseInt(e.target.value))}
			/>
			<label htmlFor="incrementInput">Increment</label>
			<input
				id="incrementInput"
				type="number"
				value={config.value.increment}
				onChange={(e) =>
					controller.setIncrement(Number.parseInt(e.target.value))
				}
			/>
			<label htmlFor="frequencyInput">Frequency</label>
			<input
				id="frequencyInput"
				type="number"
				value={config.value.frequency}
				onChange={(e) =>
					controller.setFrequency(Number.parseInt(e.target.value))
				}
			/>
			<div>
				<button type="button" onClick={() => changeModal.next("view")}>
					Close
				</button>
			</div>
		</div>
	);
};

function OffTree() {
	const filterOps = useMemo(() => {
		return operators.filter((input: number) => input % 2 === 0);
	}, []);
	const onlyEven = useObservable(counterStream, filterOps);

	if (onlyEven.hasValue) return <div>only even: {onlyEven.value}</div>;
}

function Counter() {
	const [configObservable, configController] = useResolve(configStream);

	const counterValue = useObservableValue(configObservable);
	const counterApp = useObservable(counterStream);

	const onlyOdd = useObservable(onlyOddStream);

	if (!counterValue.hasValue) return null;

	return (
		<>
			<div>
				<h2>Controller board</h2>
				<div>
					<label htmlFor="seedInput">Seed</label>
					<input
						id="seedInput"
						type="number"
						value={counterValue.value.seed}
						onChange={(e) =>
							configController.setSeed(Number.parseInt(e.target.value))
						}
					/>
				</div>

				<div>
					<label htmlFor="incrementInput">Increment</label>
					<input
						id="incrementInput"
						type="number"
						value={counterValue.value.increment}
						onChange={(e) =>
							configController.setIncrement(Number.parseInt(e.target.value))
						}
					/>
				</div>

				<div>
					<label htmlFor="frequencyInput">Frequency</label>
					<input
						id="frequencyInput"
						type="number"
						value={counterValue.value.frequency}
						onChange={(e) =>
							configController.setFrequency(Number.parseInt(e.target.value))
						}
					/>
				</div>
			</div>
			<div>
				<h2>Counter</h2>
				{counterApp.hasValue && <div>{counterApp.value}</div>}
				{onlyOdd.hasValue && <div>only odd: {onlyOdd.value}</div>}
			</div>
		</>
	);
}
