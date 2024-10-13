class Player extends Objeto {
  constructor(x, y, juego) {
    super(x, y, 3, juego);
    this.velocidadMaximaOriginal = 1;
    this.juego = juego;
    this.grid = juego.grid;
    this.explosion = 300;

    this.cargarVariosSpritesAnimados(
      {
        idle: "./img/player_idle.png",
        correr: "./img/player_run.png",
        subir: "./img/player_up.png",
        bajar: "./img/player_down.png"
      },
      64,
      64,
      0.1,
      (e) => {
        this.listo = true;
        this.cambiarSprite("idle");
      }
    );
  }


  update() {
    if (!this.listo) return;
    this.vecinos = this.obtenerVecinos();
    this.chequearColisiones(50, this.explosion)

    if (this.juego.keyboard.a && this.container.x > 50) {
      this.velocidad.x = -1;
    } else if (this.juego.keyboard.d && this.container.x < this.juego.canvasWidth - 50) {
      this.velocidad.x = 1;
    } else {
      this.velocidad.x = 0;
    }

    if (this.juego.keyboard.w && this.container.y > 50) {
      this.velocidad.y = -1;
    } else if (this.juego.keyboard.s && this.container.y < this.juego.canvasHeight - 50) {
      this.velocidad.y = 1;
    } else {
      this.velocidad.y = 0;
    }

    let cantidadDeObjetosEnMiCelda = Object.keys(
      (this.miCeldaActual || {}).objetosAca || {}
    ).length;

    if (cantidadDeObjetosEnMiCelda > 3) {
      let cant = cantidadDeObjetosEnMiCelda - 3;
      this.velocidadMax = this.velocidadMaximaOriginal * (0.3 + 0.7 / cant);
    } else {
      this.velocidadMax = this.velocidadMaximaOriginal;
    }


    //cambio de animaciones

    if (this.velocidad.y < 0) {
      this.cambiarSprite("subir");
    } else if (this.velocidad.y > 0) {
      this.cambiarSprite("bajar");
    } else if (Math.abs(this.velocidad.x) > 0) {
      this.cambiarSprite("correr");
    } else {
      this.cambiarSprite("idle");
    }
    super.update();
  }

  chequearColisiones(radio, explosion) {
    this.juego.enemigos.forEach(enemigo => {
      const distancia = Math.sqrt(
        (this.container.x - enemigo.container.x) ** 2 +
        (this.container.y - enemigo.container.y) ** 2
      );

      // Retroceder enemigos que están a 300 unidades de distancia
      if (distancia < explosion && distancia < radio) {
        enemigo.explosion = true;
        // Temporizador para restablecer la velocidad después de un tiempo
        setTimeout(() => {
          enemigo.explosion = false;
        }, 3000); // Cambia el tiempo según lo necesites

      }
    });
  }

}
