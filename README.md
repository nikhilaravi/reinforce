https://github.com/GianlucaGuarini/es6-project-starter-kit

    $ npm install
    $ npm start

STEPS
=====

- Nodes define an agent in their constructor
- Nodes serve as the environment

The environment must define the following functions:
- getNumStates
- getMaxNumActions
- getState - returns array containing all the inputs needed for determining reward
- sampleNextState - returns a new state array and a reward value

Learn loop
- in getMessage on a node, sample the next state
- get the learned action from the agent
- get the reward from the node environment
- call learn on the agent based on that reward