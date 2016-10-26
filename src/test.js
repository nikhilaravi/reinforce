/*3 belief groups

20 nodes with randomly assigned beliefs and links

every second, nodes choose to send either political or neutral messages

nodes’ activation functions are such that they change orientation if they hear 2 messages of a certain orientation in a row

nodes retweet things they hear that they agree with (BEWARE infinite loop in implementing - don’t retweet something that you already tweeted (messages need a root id), only one tweet per user per “cycle” (one loop, which is roughly one second))

nodes follow users who tweeted the thing that got them to change their minds*/

const env = {
	getNumStates: () => 1,
	getMaxNumActions: () => 4
}

const spec = { alpha: 0.01 }

const agent = new RL.DQNAgent(env, spec)

setInterval(() => {
	const action = agent.act(true)

	agent.learn(0.5)
}, 100)

export default env