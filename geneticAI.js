let population;
let count;
let lifespan = 300;
let target;
let ball;
let hit = false;
let balls = [];
let time = 0;
let timeFinal = -1;
let n = 1;
let completed = false;

function setup() {
  setupGenetic();
}

function setupGenetic() {
  createCanvas(400, 300);
  rocket = new Rocket();
  population = new Population();
  count = 0;

  target = createVector(width / 2, 8);
  page = 2;
  nome = createDiv("Tiago Costa Neves MIEIC");
  nome.position(2, height - 21);
  nome.style("color", "#6f6f6f");
  nome.style("font-size", "12pt");
}

function draw() {
  background(0);
  population.run();
  count++;
  stroke(100);
  rect(width - 300, height / 2, 200, 2);
  if (count >= lifespan) {
    count = 0;
    n++;
    population.evaluate();
    population.selection(n);
    completed = false;
  }
  if (completed)
    stroke(255, 0, 0);
  else
    stroke(0);
  ellipse(target.x, target.y, 16, 16);
}

class Population {
  constructor() {
    this.rockets = [];
    this.popsize = 100;
    this.matingpool = [];
    for (var i = 0; i < this.popsize; i++) {
      this.rockets.push(new Rocket());
    }
  }


  evaluate() {

    var maxfit = 0;
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].calcFitness();
      if (this.rockets[i].fitness > maxfit) {
        maxfit = this.rockets[i].fitness;
      }
    }

    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].fitness /= maxfit;
    }

    this.matingpool = [];

    for (var i = 0; i < this.popsize; i++) {
      var n = this.rockets[i].fitness * 100;
      for (var j = 0; j < n; j++) {
        this.matingpool.push(this.rockets[i]);
      }
    }
  };

  selection(n) {
    var newrockets = [];
    for (var i = 0; i < this.popsize; i++) {
      var parentA = random(this.matingpool).dna;
      var parentB = random(this.matingpool).dna;

      var child = parentA.crossover(parentB);
      if (!parentA.completed)
        child.mutation(n);
      newrockets[i] = new Rocket(child);
    }
    this.rockets = newrockets;
  };

  run() {
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  };
}

class DNA {
  constructor(genes) {
    if (genes) {
      this.genes = genes;
    } else {
      this.genes = [];

      for (var i = 0; i < lifespan; i++) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(0.1);
      }
    }
  }


  crossover(partner) {
    var newgenes = [];
    var mid = floor(random(this.genes.length));
    for (var i = 0; i < lifespan; i++) {
      if (i > mid) {
        newgenes[i] = this.genes[i];
      } else {
        newgenes[i] = partner.genes[i];
      }
    }

    return new DNA(newgenes);
  };

  mutation(n) {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(3) < 0.08 / n) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(0.1);
      }
    }
  };
}

class Rocket {
  constructor(dna) {
    this.pos = createVector(width / 2, height - 1);
    this.vel = createVector();
    this.acc = createVector();
    this.completed = false;
    this.crashed = false;
    this.time = 1000;
    this.fitness = 0;

    if (dna)
      this.dna = dna;
    else
      this.dna = new DNA();
  }

  applyForce(force) {
    this.acc.add(force);
  };

  update() {
    this.applyForce(this.dna.genes[count]);
    this.checkCompleted();
    if (!this.completed && !this.crashed) {
      this.updatePosition();
    }
    this.checkCrashed();
  };

  updatePosition() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  checkCompleted() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (d <= 10) {
      completed = true;
      this.completed = true;
      this.fitness = 1.5;
      this.time = count;
    }
  }

  checkCrashed() {
    //middle rectangle
    if ((this.pos.y < (height / 2) + 3) && (this.pos.y > (height / 2)) && (this.pos.x > 100) && (this.pos.x < 300))
      this.crashed = true;
    //borders
    if (this.pos.y < 1 || this.pos.y > height || this.pos.x < 0 || this.pos.x > width)
      this.crashed = true;
  }

  show() {
    stroke(255);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
  };

  calcFitness() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);

    if (!this.completed) {
      this.fitness = (1 / Math.pow(d, 2)) * 100;
    } else this.fitness = (1 / d) * (1 / Math.pow(this.time, 3)) * 8000000;
    if (this.crashed) {
      this.fitness = 0;
    }
  };
}