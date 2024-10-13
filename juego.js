// Clase Juego
class Juego {
  constructor() {
    this.pausa = false;
    this.canvasWidth = window.innerWidth  * 2;
    this.canvasHeight = window.innerHeight * 4;
    this.app = new PIXI.Application({
      width: this.canvasWidth,
      height: this.canvasHeight,
      resizeTo: window,
      backgroundColor: 0x1099bb,
    });
    document.body.appendChild(this.app.view);
    this.gridActualizacionIntervalo = 10; // Cada 10 frames
    this.contadorDeFrames = 0;
    this.grid = new Grid(50, this); // Tamaño de celda 50
    this.enemigos = [];
    this.balas = [];

    this.keyboard = {};

    this.app.stage.sortableChildren = true;

    this.ponerFondo();
    this.ponerCompanion();
    this.ponerEnemigos(500);
    this.ponerProtagonista();

    this.ponerListeners();

    setTimeout(() => {
      this.app.ticker.add(this.actualizar.bind(this));
      window.__PIXI_APP__ = this.app;
    }, 100);
  }
  ponerFondo() {
    // Crear un patrón a partir de una imagen
    PIXI.Texture.fromURL("./img/bg.png").then((patternTexture) => {
      // Crear un sprite con la textura del patrón
      this.backgroundSprite = new PIXI.TilingSprite(patternTexture, 5000 , 5000);
      this.backgroundSprite.tileScale.set(0.5);

      // Añadir el sprite al stage
      this.app.stage.addChild(this.backgroundSprite);
    });
  }
  ponerProtagonista() {
    this.player = new Player(
      window.innerWidth / 2,
      window.innerHeight * 0.9,
      this
    );
  }
  ponerCompanion() {
    this.companion = new Companion(
      window.innerWidth / 2,
      window.innerHeight * 0.9,
      this
    );
  }

  ponerEnemigos(cant) {
    // Crear algunos enemigos
    for (let i = 0; i < cant; i++) {
      //LA VELOCIDAD SE USA PARA LA VELOCIDAD MAXIMA CON LA Q SE MUEVE EL ZOMBIE
      //Y TAMBIEN PARA LA VELOCIDAD DE REPRODUCCION DE UN SPRITE
      let velocidad = Math.random() * 0.2 + 0.5;
      const enemigo = new Enemigo(
        Math.random() * this.canvasWidth,
        Math.random() * this.canvasHeight,
        velocidad,
        this
      ); // Pasar la grid a los enemigos
      this.enemigos.push(enemigo);
      this.grid.add(enemigo);
    }
  }
  mouseDownEvent() {
    this.companion.disparar();
  }

  ponerListeners() {
    // Manejar eventos del mouse
    this.app.view.addEventListener("mousedown", () => {
      (this.mouse || {}).click = true;
      this.mouseDownEvent();
    });
    this.app.view.addEventListener("mouseup", () => {
      (this.mouse || {}).click = false;
    });

    this.app.view.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.app.view.addEventListener("mouseleave", () => {
      this.mouse = null;
    });
    window.addEventListener("resize", () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("keydown", (e) => {
      this.keyboard[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      delete this.keyboard[e.key.toLowerCase()];
    });
  }

  // Actualizar la posición del mouse
  onMouseMove(event) {
    this.mouse = { x: 0, y: 0 };
    const rect = this.app.view.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }
  pausar() {
    this.pausa = !this.pausa;
  }

  actualizar() {
    if (this.pausa) return;
    this.contadorDeFrames++;
    this.player.update();
    this.companion.update();
    this.enemigos.forEach((enemigo) => {
      enemigo.update();
    });
    this.balas.forEach((bala) => {
      bala.update();
    });
    this.moverCamara();
  }

  moverCamara() {
    let lerpFactor = 0.05;
    // Obtener la posición del protagonista
    const playerX = this.player.container.x;
    const playerY = this.player.container.y;

    // Calcular la posición objetivo del stage para centrar al protagonista
    const halfScreenWidth = this.app.screen.width / 2;
    const halfScreenHeight = this.app.screen.height / 2;

    const targetX = halfScreenWidth - playerX;
    const targetY = halfScreenHeight - playerY;

    // Aplicar el límite de 0,0 y canvasWidth, canvasHeight
    const clampedX = Math.min(
      Math.max(targetX, -(this.canvasWidth - this.app.screen.width)),
      0
    );
    const clampedY = Math.min(
      Math.max(targetY, -(this.canvasHeight - this.app.screen.height)),
      0
    );

    // Aplicar Lerp para suavizar el movimiento de la cámara
    this.app.stage.position.x = lerp(
      this.app.stage.position.x,
      clampedX,
      lerpFactor
    );
    this.app.stage.position.y = lerp(
      this.app.stage.position.y,
      clampedY,
      lerpFactor
    );
  }
  
}

// Inicializar el juego
let juego = new Juego();
