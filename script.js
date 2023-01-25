// TEMPLATE FOR AN HTML WRAPPER TO A P5 SKETCH

// SEE ALSO THE P5 WIKI ON POSITIONING THE CANVAS
// https://github.com/processing/p5.js/wiki/Positioning-your-canvas

///// global variables /////
let boids = [];
let riverHover;
let wingMode = 0;

let mouseValue = 0;
let shrimpValue = 0.14;
let shrimpSpeed = 2;
let strobe = 0;
let hoverNest = 0;
let warningAnimation;

//delay vars
var delayDragonfly = 100; // delay in milliseconds
var delayX = 0; // x position of dragonfly
var delayY = 0; // y position of dragonfly

//rotate vars
let rotateX = 0;
let rotateY = 0;
let angleDragonfly = 0;

//levels of pollution
let rnLvl1 =123;
let pbLvl1 =95;
let kLvl1 =2.8;

let rnLvl2 =114;
let pbLvl2 = 92;
let kLvl2 =2.3;

//intervals
let pollutionDownInterval1;
let pollutionDownInterval2;
let pollutionUpInterval1;
let pollutionUpInterval2;
let pollutionRegularInterval1;
let pollutionRegularInterval2;


//get rid of text highlighting and right click so they're not opened by mistake
document.getElementById('wingPattern').ondragstart = function() { return false; };
document.addEventListener('contextmenu', event => event.preventDefault());

const element = document.getElementById('warning');

function preload(){
    bgMap = loadImage("https://i.ibb.co/TRpC037/tv-min.png")
}

function setup() {
	// create the canvas and set a temp initial size
  var cnv = createCanvas(windowWidth, windowHeight);
  // Move the canvas so it’s inside a <div id="sketch-container">.
  cnv.parent('sketch-container');
  noCursor();
  setInterval(function() {
    pollutionLevels();
  }, 200);

  // Create 280 boids
  for (let i = 0; i < 40; i++) {
    boids.push(new Boid1(random(width), random(height)));
    boids.push(new Boid2(random(width), random(height)));
    boids.push(new Boid3(random(width), random(height)));
    boids.push(new Boid4(random(width), random(height)));
    boids.push(new Boid5(random(width), random(height)));
    boids.push(new Boid6(random(width), random(height)));
    boids.push(new Boid7(random(width), random(height)));
  }
	// call the reiszing function below to set the correct size for the canvs
	resizeCnv();

}



function draw() {

  image(bgMap, 0, 0, width, height);
  imageMode(CORNERS);
  eggNests();
  eggNestInfo();
  // riverBorder();
  noStroke();
  hoverNestCheck();


  // Map the mouse X position to the desired range
  let mappedX = map(mouseX, 0, width, 32.54859801724620, 32.54859801724656).toFixed(14);
  let mappedY = map(mouseY, 0, height, 34.91483275600283, 34.91483275600307).toFixed(14);

  select('#coordinates').html(mappedX + ", " + mappedY);

  // Check if the mouse is inside the predetermined area
  if (wingMode === 1) {
    // if (mouseY > height/2.8 && mouseY < height/1.6) {
      // Change the values of mouseValue and shrimpValue
     mouseValue = 0.14;
     shrimpValue = 0;
     shrimpSpeed = 2.2;
     strobe = 10;
    // } else {
    // // Change the values of mouseValue and shrimpValue
    //  mouseValue = 0;
    //  shrimpValue = 0.14;
    //  shrimpSpeed = 1;
    //  strobe = 10;
    // }
  }
  if (wingMode === 0){
     mouseValue = 0;
     shrimpValue = 0.1;
     shrimpSpeed = 1;
     strobe = 0;
  }
  if (wingMode === 2){
     mouseValue = -0.29;
     shrimpValue = 0.14;
     shrimpSpeed = 2.4;
     strobe = 2;
  }

  // Update and display each boid
  for (let boid of boids) {
    boid.update();
    boid.display();
  }

  drawPointer(5, 9.15, 90);


  // textSize(32);
  // text("Wing Mode " + wingMode, 100, 100);
  // text("hover nest " + hoverNest, 100, 150);
}

// Boid class
class Boid1 {
  constructor(x, y) {
    this.position = createVector(x, height/15);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.05;
    this.maxSpeed = shrimpSpeed;
  }

  // Update the boid's position and velocity
  update() {
    // Flocking behavior
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids, 0.001);
    let separation = this.separation(boids);

    // Shrimp nests
    let nest = createVector(width/1.3, height/1.3);
    let shrimpAttraction = p5.Vector.sub(nest, this.position);
    shrimpAttraction.setMag(shrimpValue);

    // Mouse interaction
    let mouse = createVector(mouseX, mouseY);
    let mouseAttraction = p5.Vector.sub(mouse, this.position);
    mouseAttraction.setMag(mouseValue);

    // Generate a small noise value
    let randomMovement = random(-this.maxSpeed * 0.05, this.maxSpeed * 0.04);

        // Add noise to the acceleration
    let noiseMovement = createVector(noise(this.position.x, this.position.y), noise(this.position.y, this.position.x));
    noiseMovement.setMag(0.1);


    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(randomMovement);
    this.acceleration.add(noiseMovement);
    this.acceleration.add(mouseAttraction);
    this.acceleration.add(shrimpAttraction);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);


    if (this.position.y > height/1.15) {
    // this.velocity.y *= -1;
    }

    if (this.position.y < height/3.2) {
    // this.velocity.y *= -1;
    }

  }

  // Align the boid with its neighbors
  align(boids) {
    let sum = createVector();
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < 20) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector();
    }
  }

// Cohere with the average position of its neighbors
cohesion(boids, weight) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(sin(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      sum.add(other.position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum, weight);
  } else {
    return createVector();
  }
}



// Separate from its neighbors to avoid crowding
separation(boids) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(cos(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      let diff = p5.Vector.sub(this.position, other.position);
      diff.normalize();
      diff.div(d);
      sum.add(diff);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector();
  }
}


// Seek a target position
seek(target, weight) {
  let desired = p5.Vector.sub(target, this.position);
  desired.setMag(this.maxSpeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce * weight); // Multiply the steering force by the weight
  return steer;
}


// Display the boid as an orange circle
display() {
  fill(255, 40, 30);
  noStroke();
  ellipse(this.position.x, this.position.y, 3, 3);
}
  }

// Boid class
class Boid2 {
  constructor(x, y) {
    this.position = createVector(x, height/40);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.05;
    this.maxSpeed = shrimpSpeed;
  }

  // Update the boid's position and velocity
  update() {
    // Flocking behavior
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids, 0.001);
    let separation = this.separation(boids);

    // Shrimp nests
    let nest = createVector(width/1.6, height/8);
    let shrimpAttraction = p5.Vector.sub(nest, this.position);
    shrimpAttraction.setMag(shrimpValue);

    // Mouse interaction
    let mouse = createVector(mouseX, mouseY);
    let mouseAttraction = p5.Vector.sub(mouse, this.position);
    mouseAttraction.setMag(mouseValue);

    // Generate a small noise value
    let randomMovement = random(-this.maxSpeed * 0.05, this.maxSpeed * 0.04);

        // Add noise to the acceleration
    let noiseMovement = createVector(noise(this.position.x, this.position.y), noise(this.position.y, this.position.x));
    noiseMovement.setMag(0.1);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(randomMovement);
    this.acceleration.add(noiseMovement);
    this.acceleration.add(mouseAttraction);
    this.acceleration.add(shrimpAttraction);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

        if (this.position.y > height/1.15) {
    // this.velocity.y *= -1;
    }

    if (this.position.y < height/3.2) {
    // this.velocity.y *= -1;
    }
  }

  // Align the boid with its neighbors
  align(boids) {
    let sum = createVector();
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < 20) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector();
    }
  }

// Cohere with the average position of its neighbors
cohesion(boids, weight) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(sin(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      sum.add(other.position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum, weight);
  } else {
    return createVector();
  }
}



// Separate from its neighbors to avoid crowding
separation(boids) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(cos(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      let diff = p5.Vector.sub(this.position, other.position);
      diff.normalize();
      diff.div(d);
      sum.add(diff);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector();
  }
}


// Seek a target position
seek(target, weight) {
  let desired = p5.Vector.sub(target, this.position);
  desired.setMag(this.maxSpeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce * weight); // Multiply the steering force by the weight
  return steer;
}


// Display the boid as an orange circle
display() {
  fill(250, 45, 30);
  noStroke();
  ellipse(this.position.x, this.position.y, 3, 3);
}
  }

// Boid class
class Boid3 {
  constructor(x, y) {
    this.position = createVector(x, height/25);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.05;
    this.maxSpeed = shrimpSpeed;
  }

  // Update the boid's position and velocity
  update() {
    // Flocking behavior
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids, 0.001);
    let separation = this.separation(boids);

    // Shrimp nests
    let nest = createVector(width/1.05, height/3);
    let shrimpAttraction = p5.Vector.sub(nest, this.position);
    shrimpAttraction.setMag(shrimpValue);

    // Mouse interaction
    let mouse = createVector(mouseX, mouseY);
    let mouseAttraction = p5.Vector.sub(mouse, this.position);
    mouseAttraction.setMag(mouseValue);

    // Generate a small noise value
    let randomMovement = random(-this.maxSpeed * 0.05, this.maxSpeed * 0.04);

        // Add noise to the acceleration
    let noiseMovement = createVector(noise(this.position.x, this.position.y), noise(this.position.y, this.position.x));
    noiseMovement.setMag(0.1);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(randomMovement);
    this.acceleration.add(noiseMovement);
    this.acceleration.add(mouseAttraction);
    this.acceleration.add(shrimpAttraction);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

        if (this.position.y > height/1.15) {
    // this.velocity.y *= -1;
    }

    if (this.position.y < height/3.2) {
    // this.velocity.y *= -1;
    }
  }

  // Align the boid with its neighbors
  align(boids) {
    let sum = createVector();
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < 20) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector();
    }
  }

// Cohere with the average position of its neighbors
cohesion(boids, weight) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(sin(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      sum.add(other.position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum, weight);
  } else {
    return createVector();
  }
}



// Separate from its neighbors to avoid crowding
separation(boids) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(cos(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      let diff = p5.Vector.sub(this.position, other.position);
      diff.normalize();
      diff.div(d);
      sum.add(diff);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector();
  }
}


// Seek a target position
seek(target, weight) {
  let desired = p5.Vector.sub(target, this.position);
  desired.setMag(this.maxSpeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce * weight); // Multiply the steering force by the weight
  return steer;
}


// Display the boid as an orange circle
display() {
  fill(255, 30, 30);
  noStroke();
  ellipse(this.position.x, this.position.y, 3, 3);
}
  }

  // Boid class
class Boid4 {
  constructor(x, y) {
    this.position = createVector(x, height/35);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.05;
    this.maxSpeed = shrimpSpeed;
  }

  // Update the boid's position and velocity
  update() {
    // Flocking behavior
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids, 0.001);
    let separation = this.separation(boids);

    // Shrimp nests
    let nest = createVector(width/3.2, height/15);
    let shrimpAttraction = p5.Vector.sub(nest, this.position);
    shrimpAttraction.setMag(shrimpValue);

    // Mouse interaction
    let mouse = createVector(mouseX, mouseY);
    let mouseAttraction = p5.Vector.sub(mouse, this.position);
    mouseAttraction.setMag(mouseValue);

    // Generate a small noise value
    let randomMovement = random(-this.maxSpeed * 0.05, this.maxSpeed * 0.04);

        // Add noise to the acceleration
    let noiseMovement = createVector(noise(this.position.x, this.position.y), noise(this.position.y, this.position.x));
    noiseMovement.setMag(0.1);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(randomMovement);
    this.acceleration.add(noiseMovement);
    this.acceleration.add(mouseAttraction);
    this.acceleration.add(shrimpAttraction);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

        if (this.position.y > height/1.15) {
    // this.velocity.y *= -1;
    }

    if (this.position.y < height/3.2) {
    // this.velocity.y *= -1;
    }
  }

  // Align the boid with its neighbors
  align(boids) {
    let sum = createVector();
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < 20) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector();
    }
  }

// Cohere with the average position of its neighbors
cohesion(boids, weight) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(sin(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      sum.add(other.position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum, weight);
  } else {
    return createVector();
  }
}



// Separate from its neighbors to avoid crowding
separation(boids) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(cos(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      let diff = p5.Vector.sub(this.position, other.position);
      diff.normalize();
      diff.div(d);
      sum.add(diff);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector();
  }
}


// Seek a target position
seek(target, weight) {
  let desired = p5.Vector.sub(target, this.position);
  desired.setMag(this.maxSpeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce * weight); // Multiply the steering force by the weight
  return steer;
}


// Display the boid as an orange circle
display() {
  fill(255, 30, 30);
  noStroke();
  ellipse(this.position.x, this.position.y, 3, 3);
}
  }

  // Boid class
class Boid5 {
  constructor(x, y) {
    this.position = createVector(x, height/18);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.05;
    this.maxSpeed = shrimpSpeed;
  }

  // Update the boid's position and velocity
  update() {
    // Flocking behavior
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids, 0.001);
    let separation = this.separation(boids);

    // Shrimp nests
    let nest = createVector(width/5.4, height/1.6);
    let shrimpAttraction = p5.Vector.sub(nest, this.position);
    shrimpAttraction.setMag(shrimpValue);

    // Mouse interaction
    let mouse = createVector(mouseX, mouseY);
    let mouseAttraction = p5.Vector.sub(mouse, this.position);
    mouseAttraction.setMag(mouseValue);

    // Generate a small noise value
    let randomMovement = random(-this.maxSpeed * 0.05, this.maxSpeed * 0.04);

        // Add noise to the acceleration
    let noiseMovement = createVector(noise(this.position.x, this.position.y), noise(this.position.y, this.position.x));
    noiseMovement.setMag(0.1);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(randomMovement);
    this.acceleration.add(noiseMovement);
    this.acceleration.add(mouseAttraction);
    this.acceleration.add(shrimpAttraction);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

        if (this.position.y > height/1.15) {
    // this.velocity.y *= -1;
    }

    if (this.position.y < height/3.2) {
    // this.velocity.y *= -1;
    }
  }

  // Align the boid with its neighbors
  align(boids) {
    let sum = createVector();
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < 20) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector();
    }
  }

// Cohere with the average position of its neighbors
cohesion(boids, weight) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(sin(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      sum.add(other.position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum, weight);
  } else {
    return createVector();
  }
}



// Separate from its neighbors to avoid crowding
separation(boids) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(cos(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      let diff = p5.Vector.sub(this.position, other.position);
      diff.normalize();
      diff.div(d);
      sum.add(diff);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector();
  }
}


// Seek a target position
seek(target, weight) {
  let desired = p5.Vector.sub(target, this.position);
  desired.setMag(this.maxSpeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce * weight); // Multiply the steering force by the weight
  return steer;
}


// Display the boid as an orange circle
display() {
  fill(255, 30, 30);
  noStroke();
  ellipse(this.position.x, this.position.y, 3, 3);
}
  }

  // Boid class
class Boid6 {
  constructor(x, y) {
    this.position = createVector(x, height/12);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.05;
    this.maxSpeed = shrimpSpeed;
  }

  // Update the boid's position and velocity
  update() {
    // Flocking behavior
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids, 0.001);
    let separation = this.separation(boids);

    // Shrimp nests
    let nest = createVector(width/20, height/4.6);
    let shrimpAttraction = p5.Vector.sub(nest, this.position);
    shrimpAttraction.setMag(shrimpValue);

    // Mouse interaction
    let mouse = createVector(mouseX, mouseY);
    let mouseAttraction = p5.Vector.sub(mouse, this.position);
    mouseAttraction.setMag(mouseValue);

    // Generate a small noise value
    let randomMovement = random(-this.maxSpeed * 0.05, this.maxSpeed * 0.04);

        // Add noise to the acceleration
    let noiseMovement = createVector(noise(this.position.x, this.position.y), noise(this.position.y, this.position.x));
    noiseMovement.setMag(0.1);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(randomMovement);
    this.acceleration.add(noiseMovement);
    this.acceleration.add(mouseAttraction);
    this.acceleration.add(shrimpAttraction);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

        if (this.position.y > height/1.15) {
    // this.velocity.y *= -1;
    }

    if (this.position.y < height/3.2) {
    // this.velocity.y *= -1;
    }
  }

  // Align the boid with its neighbors
  align(boids) {
    let sum = createVector();
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < 20) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector();
    }
  }

// Cohere with the average position of its neighbors
cohesion(boids, weight) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(sin(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      sum.add(other.position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum, weight);
  } else {
    return createVector();
  }
}



// Separate from its neighbors to avoid crowding
separation(boids) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(cos(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      let diff = p5.Vector.sub(this.position, other.position);
      diff.normalize();
      diff.div(d);
      sum.add(diff);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector();
  }
}


// Seek a target position
seek(target, weight) {
  let desired = p5.Vector.sub(target, this.position);
  desired.setMag(this.maxSpeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce * weight); // Multiply the steering force by the weight
  return steer;
}


// Display the boid as an orange circle
display() {
  fill(255, 30, 30);
  noStroke();
  ellipse(this.position.x, this.position.y, 3, 3);
}
  }

class Boid7 {
  constructor(x, y) {
    this.position = createVector(x, height/13);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.05;
    this.maxSpeed = shrimpSpeed;
  }

  // Update the boid's position and velocity
  update() {
    // Flocking behavior
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids, 0.001);
    let separation = this.separation(boids);

    // Shrimp nests
    let nest = createVector(width/2, height/2);
    let shrimpAttraction = p5.Vector.sub(nest, this.position);
    shrimpAttraction.setMag(shrimpValue);

    // Mouse interaction
    let mouse = createVector(mouseX, mouseY);
    let mouseAttraction = p5.Vector.sub(mouse, this.position);
    mouseAttraction.setMag(mouseValue);

    // Generate a small noise value
    let randomMovement = random(-this.maxSpeed * 0.05, this.maxSpeed * 0.04);

        // Add noise to the acceleration
    let noiseMovement = createVector(noise(this.position.x, this.position.y), noise(this.position.y, this.position.x));
    noiseMovement.setMag(0.1);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(randomMovement);
    this.acceleration.add(noiseMovement);
    this.acceleration.add(mouseAttraction);
    this.acceleration.add(shrimpAttraction);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

        if (this.position.y > height/1.15) {
    // this.velocity.y *= -1;
    }

    if (this.position.y < height/3.2) {
    // this.velocity.y *= -1;
    }
  }

  // Align the boid with its neighbors
  align(boids) {
    let sum = createVector();
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < 20) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector();
    }
  }

// Cohere with the average position of its neighbors
cohesion(boids, weight) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(sin(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      sum.add(other.position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum, weight);
  } else {
    return createVector();
  }
}



// Separate from its neighbors to avoid crowding
separation(boids) {
  let sum = createVector();
  let count = 0;

  // Use a sin function to determine the distance threshold
  let time = millis() / 1000; // Get the current time in seconds
  let distanceThreshold = map(cos(time), -1, 1, 0, 50);

  for (let other of boids) {
    let d = p5.Vector.dist(this.position, other.position);
    if (d > 0 && d < distanceThreshold) {
      let diff = p5.Vector.sub(this.position, other.position);
      diff.normalize();
      diff.div(d);
      sum.add(diff);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector();
  }
}


// Seek a target position
seek(target, weight) {
  let desired = p5.Vector.sub(target, this.position);
  desired.setMag(this.maxSpeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce * weight); // Multiply the steering force by the weight
  return steer;
}


// Display the boid as an orange circle
display() {
  fill(255, 30, 30);
  noStroke();
  ellipse(this.position.x, this.position.y, 3, 3);
}
  }

function riverBorder() {
  stroke(255);
  strokeWeight(1);
  noFill();

  // ellipse(height/3, height/3.2, 50, 50)
  // ellipse(height/3, height/1.35, 50, 50)

  stroke(200);
  ellipse(width/1.3, height/1.3, 50, 50)


  stroke(50);
  ellipse(width/1.6, height/8, 50, 50)


  stroke(50);
  ellipse(width/1.04, height/3, 50, 50)
  ellipse(width/3.2, height/15, 50, 50)
  ellipse(width/5.4, height/1.6, 50, 50)

  ellipse(width/20, height/4.6, 50, 50)
  ellipse(width/2, height/2, 50, 50)
}

function drawPointer(size, angleWings, dragonFlyAngle) {
  drawingContext.setLineDash([1, 0]);

  //rotate and delay dragonfly
  rotateX = lerp(rotateX, mouseX, 0.11);
  rotateY = lerp(rotateY, mouseY, 0.11);
  angleDragonfly = atan2(mouseY - rotateY, mouseX - rotateX);

  //pointer
  fill(130, 5);
  stroke(255, 50);  // white stroke
  strokeWeight(1);  // stroke weight of 5 pixels
  ellipse(mouseX, mouseY, size*9, size*9);

  let delay = strobe; // number of frames to delay
  let x;
  let y;
  fill(130,200);
  // update x and y with mouse position, but only after the delay
  if (frameCount % delay == 0) {
    x = mouseX;
    y = mouseY;
  }

  ellipse(x, y, size*9, size*9);

  strokeWeight(0);  // stroke weight of 5 pixels
  fill(200,100);
  // ellipse(mouseX, mouseY, 1, height/size*20);
  // ellipse(mouseX, mouseY, width/size*30, 1);

  push()
    translate(rotateX, rotateY);
    rotate(angleDragonfly+radians(dragonFlyAngle));

    //dragonfly

    fill(180);
    push()
      rotate(angleWings)
      ellipse(0, 2, width/size/20, 2);
    pop()

    push()
      rotate(-angleWings)
      ellipse(-0, 2, width/size/20, 2);
    pop()

    fill(200);
    ellipse(0, 0, 1.5, height/size/14);

    fill(255,255,255,20);
    push()
    rotate(angleWings+1)
    ellipse(0, 2, width/size/20, 4);
  pop()

  push()
    rotate(-angleWings-1)
    ellipse(-0, 2, width/size/20, 4);
  pop()
  pop()
}


function eggNests() {
  pbLvlColor1 = map(pbLvl1, 0, 100, 1, 255);
  pbLvlBright1 = map(pbLvl1, 0, 100, 80, 0);
  pbLvlBlue1 = map(pbLvl1, 0, 100, 255, 0);

  pbLvlColor2 = map(pbLvl2, 0, 100, 1, 255);
  pbLvlBright2 = map(pbLvl2, 0, 100, 80, 0);
  pbLvlBlue2 = map(pbLvl2, 0, 100, 255, 0);

  // hover on egg zone to change color
  switch (true) {
    case (hoverNest == 1):
      // highlighted zone
      drawingContext.setLineDash([3, 4]);
      stroke(pbLvlColor1, 20+pbLvlBright1, 255-pbLvlColor1, 100);
      strokeWeight(2);
      fill(pbLvlColor1, 20+pbLvlBright1, 255-pbLvlColor1, 60);
      ellipse(width/3.2, height/2.4, 250, 250);

      // unhighlighted zone
      stroke(pbLvlColor2, 20+pbLvlBright2, pbLvlBlue2, 80);
      strokeWeight(1.5);
      fill(pbLvlColor2, 20+pbLvlBright2, pbLvlBlue2, 25);
      ellipse(width/1.35, height/1.7, 250, 250);
      drawingContext.setLineDash([0, 0]);
      break;
    case (hoverNest == 2):
      // highlighted zone
      drawingContext.setLineDash([3, 4]);
      stroke(pbLvlColor2, 20+pbLvlBright2, 255-pbLvlColor2, 100);
      strokeWeight(2);
      fill(pbLvlColor2, 20+pbLvlBright2, 255-pbLvlColor2, 60);
      ellipse(width/1.35, height/1.7, 250, 250);

      // unhighlighted zone
      stroke(pbLvlColor1, 20+pbLvlBright1, pbLvlBlue1, 80);
      strokeWeight(1.5);
      fill(pbLvlColor1, 20+pbLvlBright1, pbLvlBlue1, 25);
      ellipse(width/3.2, height/2.4, 250, 250);
      drawingContext.setLineDash([0, 0]);
      break;
    default:
      drawingContext.setLineDash([3, 4]);
      stroke(pbLvlColor1, 20+pbLvlBright1, pbLvlBlue1, 80);
      strokeWeight(1.5);
      fill(pbLvlColor1, 20+pbLvlBright1, pbLvlBlue1, 25);
      ellipse(width/3.2, height/2.4, 250, 250);

      stroke(pbLvlColor2, 20+pbLvlBright2, pbLvlBlue2, 80);
      strokeWeight(1.5);
      fill(pbLvlColor2, 20+pbLvlBright2, pbLvlBlue2, 25);
      ellipse(width/1.35, height/1.7, 250, 250);
      drawingContext.setLineDash([0, 0]);
  }

}

function hoverNestCheck() {
  switch (true) {
    case (mouseX > width/4 && mouseX < width/4+250 && mouseY > height/3.2 && mouseY < height/3.2+250):
      hoverNest = 1;
      break;
    case (mouseX > width/1.49 && mouseX < width/1.49+250 && mouseY > height/2.1 && mouseY < height/2.1+250):
      hoverNest = 2;
      break;
    default:
      hoverNest = 0;
  }
}

function eggNestInfo() {

  //hover on egg zone to show cards
  if (hoverNest == 1) {
    // infoCard(width/4+130, height/2.4+62.5, rnLvl1, pbLvl1, kLvl1);
    infoCard(mouseX+30, mouseY+55, rnLvl1, pbLvl1, kLvl1);
  }

  if (hoverNest == 2) {
    infoCard(mouseX+30, mouseY+55, rnLvl2, pbLvl2, kLvl2);
  }

}

function infoCard(x, y, rnLvl, pbLvl, kLvl) {
  pbLvlColor = map(pbLvl, 0, 100, 1, 255);
  pbLvlBright = map(pbLvl, 0, 100, 80, 0);

  //container
  stroke(pbLvlColor, 20+pbLvlBright, 255-pbLvlColor, 95);
  strokeWeight(1.5);
  fill(pbLvlColor, 20+pbLvlBright, 255-pbLvlColor, 35);
  rect(x, y-108, 150, 100, 8);

  //title
  textSize(16);
  fill(pbLvlColor, 38+(pbLvlBright-30), 255-pbLvlColor);
  textFont('Lato');
  textStyle(ITALIC);
  text('Pollution Levels', x+8, y-84);
  textFont('Helvetica');
  textStyle(NORMAL);

  //bar text
  rnLvlDisplay = parseFloat(rnLvl.toFixed(0));
  pbLvlDisplay = parseFloat(pbLvl.toFixed(0));
  kLvlDisplay = parseFloat(kLvl.toFixed(1));

  fill(255);
  textSize(14);
  text(rnLvlDisplay+'Rn', x+8, y-63);
  text(pbLvlDisplay+'Pb', x+8, y-43);
  text(kLvlDisplay+'K', x+8, y-23);

  //bars containers
  fill(pbLvlColor, 20+pbLvlBright, 255-pbLvlColor, 30);
  noStroke();
  rect(x + 60, y-73, 80, 10, 2.5);
  rect(x + 60, y-53, 80, 10, 2.5);
  rect(x + 60, y-33, 80, 10, 2.5);

  //bars
  fill(pbLvlColor, 38+(pbLvlBright-30), 255-(pbLvlColor*1.4));

  rnLvlBar = map(rnLvl, 0, 140, 1, 75);
  pbLvlBar = map(pbLvl, 0, 100, 1, 75);
  kLvlBar = map(kLvl, 0, 3, 1, 75);

  rect(x + 62.5, y-70.5, rnLvlBar, 5, 1.5);
  rect(x + 62.5, y-50.5, pbLvlBar, 5, 1.5);
  rect(x + 62.5, y-30.5, kLvlBar, 5, 1.5);
}

function pollutionLevels() {
  if (wingMode == 1 && hoverNest > 0) {
      pollutionLevelsDown();
  }

  if (wingMode == 1 && hoverNest == 0) {
    pollutionLevelsRegular();
  }

  if (wingMode == 2) {
    pollutionLevelsUp();
  }

  if (wingMode == 0) {
    pollutionLevelsRegular();
  }

}

function pollutionLevelsDown() {
    //hover on egg zone to act
    if (hoverNest == 1) {
      setTimeout(function() {
        if (rnLvl1 > 12) {
          rnLvl1 -= 1;
        }
        if (pbLvl1 > 4) {
          pbLvl1 -= 0.8;
        }
        if (kLvl1 > 0.3) {
          kLvl1 -= 0.035;
        }

        if (rnLvl2 < 128) {
          rnLvl2 += 0.3;
        }
        if (pbLvl2 < 96) {
          pbLvl2 += 0.2;
        }
        if (kLvl2 < 2.7) {
          kLvl2 += 0.008;
        }
      }, 4000);
      return;
    }

    if (hoverNest == 2) {
      setTimeout(function() {
        if (rnLvl2 > 12) {
          rnLvl2 -= 1;
        }
        if (pbLvl2 > 5) {
          pbLvl2 -= 0.8;
        }
        if (kLvl2 > 0.3) {
          kLvl2 -= 0.035;
        }

        if (rnLvl1 < 132) {
          rnLvl1 += 0.3;
        }
        if (pbLvl1 < 96) {
          pbLvl1 += 0.2;
        }
        if (kLvl1 < 2.8) {
          kLvl1 += 0.008;
        }
      }, 4000);
      return;
    }
}

function pollutionLevelsUp() {
  //hover on egg zone to act
  if (hoverNest == 1) {
      if (rnLvl1 < 139) {
        rnLvl1 += 0.6;
      }
      if (pbLvl1 < 100) {
        pbLvl1 += 0.4;
      }
      if (kLvl1 < 3) {
        kLvl1 += 0.015;
      }

      if (rnLvl2 < 128) {
        rnLvl2 += 0.6;
      }
      if (pbLvl2 < 96) {
        pbLvl2 += 0.4;
      }
      if (kLvl2 < 2.7) {
        kLvl2 += 0.016;
      }
    return;
  }

  if (hoverNest == 2) {
      if (rnLvl2 < 140) {
        rnLvl2 += 0.5;
      }
      if (pbLvl2 < 99) {
        pbLvl2 += 0.5;
      }
      if (kLvl2 < 3) {
        kLvl2 += 0.017;
      }

      if (rnLvl1 < 132) {
        rnLvl1 += 0.5;
      }
      if (pbLvl1 < 96) {
        pbLvl1 += 0.4;
      }
      if (kLvl1 < 2.8) {
        kLvl1 += 0.015;
      }
    return;
  }
}

function pollutionLevelsRegular() {
    if (rnLvl1 < 132) {
      rnLvl1 += 0.5;
    }
    if (pbLvl1 < 96) {
      pbLvl1 += 0.4;
    }
    if (kLvl1 < 2.8) {
      kLvl1 += 0.016;
    }
    if (rnLvl2 < 128) {
      rnLvl2 += 0.55;
    }
    if (pbLvl2 < 96) {
      pbLvl2 += 0.45;
    }
    if (kLvl2 < 2.7) {
      kLvl2 += 0.016;
    }
}




/////event listeners/////

//keyboard presses
function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    wingMode = 1;
    pollutionLevels();
    document.getElementById("wingPattern").src = "img/atract.png";
    document.getElementById("titleState").innerHTML = "Ovipositio-Hypnotica";
    document.getElementById("subtitle").innerHTML = "Attraction of the Red Shrimp";

    warningAnimation = setTimeout(function() {
      element.classList.add('animate');
    }, 45000); 
  }
  if (keyCode === RIGHT_ARROW) {
    clearTimeout(warningAnimation);
    wingMode = 2;
    pollutionLevels();
    document.getElementById("wingPattern").src = "img/repel.png";
    document.getElementById("titleState").innerHTML = "Amplexation";
    document.getElementById("subtitle").innerHTML = "Repulsion of the Red Shrimp";

    element.classList.remove('animate');
  }
  if (keyCode === UP_ARROW) {
    wingMode = 0;
    pollutionLevels();
    document.getElementById("wingPattern").src = "img/normal.png";
    document.getElementById("titleState").innerHTML = "Ingenuita-Alarum";
    document.getElementById("subtitle").innerHTML = "No Effect on the Red Shrimp";

  }
}

//mouse clicks logic
function mousePressed() {

}


// resize the canvas according to the size of its containing element
function resizeCnv(){

	// get the inner width of the containing element
	var w = document.getElementById("sketch-container").clientWidth;

	var h = document.getElementById("sketch-container").clientHeight;
  resizeCanvas(w, h);
	// resizeing the canvas resets the drawing anyway!
	background(127);
}



function windowResized() { // flexible canvas size
  resizeCanvas(windowWidth, windowHeight);
}

function mouseMoved() {

}
