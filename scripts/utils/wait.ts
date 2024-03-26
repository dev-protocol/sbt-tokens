export const wait = async (ms: number) =>
	new Promise((resolve) => {
		setInterval(resolve, ms)
	})
