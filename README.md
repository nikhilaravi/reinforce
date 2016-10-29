https://github.com/GianlucaGuarini/es6-project-starter-kit

    $ npm install
    $ npm start

STEPS
=====

Initialize an agent with an environment and some specifications

The environment must define the following functions:
- getNumStates
- getMaxNumActions
- getState - returns array containing all the inputs needed for determining reward
- sampleNextState - returns a new state array and a reward value

Learn loop
- get the state from the environment
- get the learned action from the agent
- get the sampled next state based on the action
- call learn on the agent based on the reward
- have the UI reflect: action, state

FOR OUR PURPOSES
----------------

- Nodes define an agent in their constructor
- Nodes serve as the environment

Learn loop
- in getMessage on a node, sample the next state
- get the learned action from the agent
- get the reward from the node environment
- call learn on the agent based on that reward