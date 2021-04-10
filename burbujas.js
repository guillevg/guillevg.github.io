let capture;
let filtro;
let puntos = [0, 0];

class DianaColor {
  constructor(r, g, b, N) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.N = N;
    this.x = new Array(N);
    this.y = new Array(N);
    this.dmax = 3 * 255*2;
    this.xc = 0;
    this.yc = 0;
    this.imax = 0;
    this.step = 0;
  }
  reset() {
    this.dmax = 3 * 255**2;
    this.imax = 0;
    this.step += 1;
    this.step %= this.N;
  }
  nuevo_punto(r, g, b, i) {
    let d = this.distancia_a(r, g, b);
    if (d < this.dmax) {
      this.dmax = d;
      this.imax = i;
    }
  }
  distancia_a(r, g, b) {
    return (this.r - r)**2 + (this.g - g)**2 + (this.b - b)**2
  }
  check() {
    let x = this.imax % capture.width;
    let y = floor(this.imax / capture.width);
    this.x[this.step] = x;
    this.y[this.step] = y;
    this.xc = this.x.reduce((a, b) => a + b, 0) / this.N;
    this.yc = this.y.reduce((a, b) => a + b, 0) / this.N;
  }
  diana() {
    stroke(this.r, this.g, this.b);
    noFill();
    ellipse(this.xc, this.yc, 20, 20);
  }
}

class Burbuja {
  constructor(x, y, r) {
    this.x = x;
    this.vx = 0;
    this.vy = 3;
    this.y = y;
    this.r = r;
    this.vida = -50;
  }
  mueve() {
    if (this.vida < 0) {
      this.x += this.vx;
      this.y += this.vy;
      this.vx += (-1) ** int(random(2));
      if (abs(this.vx) > 5) {
        this.vx = this.vx / abs(this.vx) * 5;
      }
      //this.vy += 1;
    } else if (this.vida > 0) {
      this.vida -= 1;
    } else {
      // console.log('chao!');
    }
  }
  dibuja() {
    if (this.vida < 0) {      
      fill(230, 230, 255, 200);
      stroke(255);
    } else {
      fill(230, 230, 255, map(this.vida, 50, 0, 200, 0));
      noStroke();
    }
    ellipse(this.x, this.y, 2 * this.r, 2 * this.r);
  }
  explota(x, y, player) {
    if ((this.x - x) ** 2 + (this.y - y) ** 2 < this.r ** 2) {
      if (this.vida < 0) {
        this.vida *= -1;        
        console.log('punto para jugador ' + player + '!');
        puntos[player-1]++;
        console.log(puntos);
      }
    }
  }
}

class Burbujeo {
  constructor() {
    this.burbujas = []
  }
  nueva() {
    let b = new Burbuja(int(random(width)), -30, int(random(20, 50)));
    //console.log(b);
    this.burbujas.push(b);
  }
  dibujar() {
    this.burbujas.forEach(burbuja => burbuja.dibuja());
  }
  mover() {
    this.burbujas.forEach(burbuja => burbuja.mueve());    
  }
  explota(x, y, player) {
    this.burbujas.forEach(burbuja => burbuja.explota(x, y, player));      
  }
  purga() {
    for (let i = this.burbujas.length - 1; i >= 0; i--) {
      if (this.burbujas[i].vida == 0) {
        this.burbujas.splice(i, 1);
      }
    }
  }
}

let rojo = new DianaColor(255, 0, 0, 10);
let azul = new DianaColor(0, 0, 255, 10);
let dianas = [rojo, azul];

let burbujeo = new Burbujeo();
let t = 0;

function setup() {
  createCanvas(640, 480);
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();
  noFill();
  ellipseMode(CENTER);
  t = int(random(80, 300));
}

function draw() {
  push();
  translate(width, 0);
  scale(-2, 2);
  background(0, 0, 0, 50);
  image(capture, 0, 0);
  capture.loadPixels();
  dianas.forEach(diana => diana.reset());
  let r, g, b, d;
  for (let i=0; i < capture.pixels.length; i += 4) {
    // pixels contiene las componentes de color ya separadas
    // y ordenadas por pixel: 00, 10, 20, ..., w0, 01, 11, ...
    // pixels = [R, G, B, A, R, G, B, A, ...]
    r = capture.pixels[i];
    g = capture.pixels[i+1];
    b = capture.pixels[i+2];
    dianas.forEach(diana => diana.nuevo_punto(r, g, b, i/4));
  }
  //filter(GRAY);
  dianas.forEach(diana => diana.check());
  dianas.forEach(diana => diana.diana());
  burbujeo.explota(rojo.xc, rojo.yc, 1);
  burbujeo.explota(azul.xc, azul.yc, 2);
  burbujeo.mover();
  burbujeo.dibujar();
  burbujeo.purga();
  
  pop();
  textSize(50);
  stroke(10);
  fill(255);
  text(str(puntos[0]) + ' - ' + str(puntos[1]), 20, 50);
  
  t -= 1;
  if (t == 0) {
    burbujeo.nueva();
    t = int(random(30, 100));
    // console.log('nueva!');
  }
  // console.log(frameRate());
}

