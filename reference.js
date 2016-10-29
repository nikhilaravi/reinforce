var W = 600, H = 600,
  d3line = null,
  d3agent = null,
  d3target = null,
  d3target2 = null,
  d3target2_radius = null,
  action, state;

var initDraw = function() {
  svg = d3.select("#draw svg g");

  // draw the puck
  d3agent = svg.append('circle')
    .attr('cx', 100)
    .attr('cy', 100)
    .attr('r', env.rad * this.W)
    .attr('fill', '#FF0')
    .attr('stroke', '#000')
    .attr('id', 'puck');

  // draw the target
  d3target = svg.append('circle')
    .attr('cx', 200)
    .attr('cy', 200)
    .attr('r', 10)
    .attr('fill', '#0F0')
    .attr('stroke', '#000')
    .attr('id', 'target');

  // bad target
  d3target2 = svg.append('circle')
    .attr('cx', 300)
    .attr('cy', 300)
    .attr('r', 10)
    .attr('fill', '#F00')
    .attr('stroke', '#000')
    .attr('id', 'target2');

  d3target2_radius = svg.append('circle')
    .attr('cx', 300)
    .attr('cy', 300)
    .attr('r', 10)
    .attr('fill', 'rgba(255,0,0,0.1)')
    .attr('stroke', '#000');

  // draw line indicating forces
  d3line = svg.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', 0)
    .attr('stroke', 'black')
    .attr('stroke-width', '2')
    .attr("marker-end", "url(#arrowhead)");
}

var updateDraw = function(a, s, r) {
  // reflect puck world state on screen
  var ppx = env.ppx; var ppy = env.ppy;
  var tx = env.tx; var ty = env.ty;
  var tx2 = env.tx2; var ty2 = env.ty2;

  d3agent.attr('cx', ppx*W).attr('cy', ppy*H);
  d3target.attr('cx', tx*W).attr('cy', ty*H);
  d3target2.attr('cx', tx2*W).attr('cy', ty2*H);
  d3target2_radius.attr('cx', tx2*W).attr('cy', ty2*H).attr('r', env.BADRAD * H);
  d3line.attr('x1', ppx*W).attr('y1', ppy*H).attr('x2', ppx*W).attr('y2', ppy*H);
  var af = 20;
  d3line.attr('visibility', a === 4 ? 'hidden' : 'visible');
  if(a === 0) {
    d3line.attr('x2', ppx*W - af);
  }
  if(a === 1) {
    d3line.attr('x2', ppx*W + af);
  }
  if(a === 2) {
    d3line.attr('y2', ppy*H - af);
  }
  if(a === 3) {
    d3line.attr('y2', ppy*H + af);
  }

  // color agent by reward
  var vv = r + 0.5;
  var ms = 255.0;
  if(vv > 0) { g = 255; r = 255 - vv*ms; b = 255 - vv*ms; }
  if(vv < 0) { g = 255 + vv*ms; r = 255; b = 255 + vv*ms; }
  var vcol = 'rgb('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+')';
  d3agent.attr('fill', vcol); 
}

var PuckWorld = function() { 
  this.ppx = Math.random(); // puck x,y
  this.ppy = Math.random();
  this.pvx = Math.random()*0.05 -0.025; // velocity
  this.pvy = Math.random()*0.05 -0.025;
  this.tx = Math.random(); // target
  this.ty = Math.random();
  this.tx2 = Math.random(); // target
  this.ty2 = Math.random(); // target
  this.rad = 0.05;
  this.t = 0;

  this.BADRAD = 0.25;
}

PuckWorld.prototype = {
  getNumStates: function() { return 8; /* x,y,vx,vy, puck dx,dy */ },
  getMaxNumActions: function() { return 5; /* left, right, up, down, nothing */ },
  getState: function() {
    var s = [this.ppx - 0.5, this.ppy - 0.5, this.pvx * 10, this.pvy * 10, this.tx-this.ppx, this.ty-this.ppy, this.tx2-this.ppx, this.ty2-this.ppy];
    return s;
  },
  sampleNextState: function(a) {
    // world dynamics
    this.ppx += this.pvx; // newton
    this.ppy += this.pvy;
    this.pvx *= 0.95; // damping
    this.pvy *= 0.95;

    // agent action influences puck velocity
    var accel = 0.002;
    if(a === 0) this.pvx -= accel;
    if(a === 1) this.pvx += accel;
    if(a === 2) this.pvy -= accel;
    if(a === 3) this.pvy += accel;

    // handle boundary conditions and bounce
    if(this.ppx < this.rad) {
      this.pvx *= -0.5; // bounce!
      this.ppx = this.rad;
    }
    if(this.ppx > 1 - this.rad) {
      this.pvx *= -0.5;
      this.ppx = 1 - this.rad;
    }
    if(this.ppy < this.rad) {
      this.pvy *= -0.5; // bounce!
      this.ppy = this.rad;
    }
    if(this.ppy > 1 - this.rad) {
      this.pvy *= -0.5;
      this.ppy = 1 - this.rad;
    }

    this.t += 1;
    if(this.t % 100 === 0) {
      this.tx = Math.random(); // reset the target location
      this.ty = Math.random();
    }

    // compute distances
    var dx = this.ppx - this.tx;
    var dy = this.ppy - this.ty;
    var d1 = Math.sqrt(dx*dx+dy*dy);

    var dx = this.ppx - this.tx2;
    var dy = this.ppy - this.ty2;
    var d2 = Math.sqrt(dx*dx+dy*dy);

    var dxnorm = dx/d2;
    var dynorm = dy/d2;
    var speed = 0.001;
    this.tx2 += speed * dxnorm;
    this.ty2 += speed * dynorm;

    // compute reward
    var r = -d1; // want to go close to green
    if(d2 < this.BADRAD) {
      // but if we're too close to red that's bad
      r += 2*(d2 - this.BADRAD)/this.BADRAD;
    }

    // evolve state in time
    var ns = this.getState();
    var out = {'ns':ns, 'r':r};
    return out;
  }
}

function togglelearn() {
  setInterval(function() {
    state = env.getState();
    action = agent.act(state);
    var obs = env.sampleNextState(action);
    agent.learn(obs.r);
    updateDraw(action, state, obs.r);
  }, 20); 
}

function start() {
  env = new PuckWorld();

  initDraw();      

  agent = new RL.DQNAgent(env, {
    update: 'qlearn', 
    gamma: 0.9, // discount factor, [0, 1)
    epsilon: 0.2, // initial epsilon for epsilon-greedy policy, [0, 1)
    alpha: 0.01, // value function learning rate
    experience_add_every: 10, // number of time steps before we add another experience to replay memory
    experience_size: 5000, // size of experience replay memory
    learning_steps_per_iteration: 20,
    tderror_clamp: 1.0, // for robustness
    num_hidden_units: 100 // number of neurons in hidden layer
  });

  togglelearn(); // start
}