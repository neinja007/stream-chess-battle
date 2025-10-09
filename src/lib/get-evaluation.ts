export const getEvaluation = async (fen: string) => {
	const response = await fetch(`https://lichess.org/api/cloud-eval?fen=${fen}&multiPv=0&variant=standard`);
	const data = await response.json();
	return { depth: data.depth, evaluation: data.pvs[0].cp || data.pvs[0].mate };
};
