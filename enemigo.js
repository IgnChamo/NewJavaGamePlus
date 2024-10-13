
// Asegúrate de que el archivo utils.js esté incluido en tu index.html antes de este script

class Enemigo extends Objeto {
  constructor(x, y, velocidad, juego) {
    super(x, y, velocidad, juego);
    this.equipoParaUpdate = Math.floor(Math.random() * 9) + 1;
    this.juego = juego;
    this.grid = juego.grid; // Referencia a la grid
    this.vision = 200;
    this.vida = 1;
    this.debug = 0;
    this.explosion = false;

    this.cargarVariosSpritesAnimados(
      {
        correr: "./img/isacc_idle.png",
        //morir: "./img/enemigo_die.png",
        //recibeTiro: "./img/enemigo_hurt.png",
      },
      32,
      32,
      velocidad * 0.5,
      (e) => {
        this.listo = true;
        this.cambiarSprite("correr");
      }
    );

    this.estados = { IDLE: 0, YENDO_AL_PLAYER: 1, RETROCEDIENDO: 2 };
    this.estado = this.estados.IDLE;
  }

  recibirTiro() {
    this.vida -= 1;
    if (this.vida <= 0) {
      this.juego.enemigos = this.juego.enemigos.filter((k) => k != this);
      this.aumentarRangoEnemigos();
      this.juego.player.aumentarAsesinatos();
      this.grid.remove(this);
      this.desaparecer();

      
    } else {

      this.velocidad.x = 0;
      this.velocidad.y = 0;
    }
  }
  aumentarRangoEnemigos(){
    this.juego.enemigos.forEach(enemigo => {
      enemigo.vision += 100;
      console.log("subio la visionFija", this.vision);
    });
  }
  desaparecer() {
    // Elimina el enemigo del contenedor de la escena
    this.container.parent.removeChild(this.container);
  }

  mirarAlrededor() {
    this.vecinos = this.obtenerVecinos();
    this.celdasVecinas = this.miCeldaActual.obtenerCeldasVecinas();
    this.estoyViendoAlPlayer = this.evaluarSiEstoyViendoAlPlayer();
    this.tengoDeVecinoAlPlayer = false;

    if (this.estoyViendoAlPlayer) {
      this.tengoDeVecinoAlPlayer = this.vecinos.includes(this.juego.player);
    }

    if (this.tengoDeVecinoAlPlayer) {
      //SOLO SI LO TENGO DE VECINO, CALCULO LA DISTANCIA, Y ES LA DISTANCIA RAPIDA
      this.distanciaAlPlayer = calculoDeDistanciaRapido(
        this.container.x,
        this.container.y,
        this.juego.player.container.x,
        this.juego.player.container.y
      );
      //Y SI LA DISTANCIA ES MENOR A UNA CELDA, Q EN ESTE CASO LAS CELDAS NOS QUEDAN A UNA DISTANCIA Q QUEDA BIEN
    } else {
      this.distanciaAlPlayer = null;
    }
  }

  segunDatosCambiarDeEstado() {
    if (!this.explosion) {
      if (this.estoyViendoAlPlayer) {
        this.estado = this.estados.YENDO_AL_PLAYER;
      } else {
        this.estado = this.estados.IDLE;
      }
    }
    else {
      this.estado = this.estados.RETROCEDIENDO;
    }
  }

  hacerCosasSegunEstado() {
    let vecAtraccionAlPlayer,
      vecSeparacion,
      vecAlineacion,
      vecCohesion,
      bordes;

    let sumaDeVectores = new PIXI.Point(0, 0);

    //CALCULO LA FUERZA Q TRAE AL PERSONAJE PADENTRO DE LA PANTALLA DE NUEVO
    bordes = this.ajustarPorBordes();

    if (this.estado == this.estados.YENDO_AL_PLAYER) {
      //SI ESTOY VIENDO AL PLAYER, HACERLE ATRACCION
      vecAtraccionAlPlayer = this.atraccionAlJugador();
      this.cambiarSprite("correr");
    } else if (this.estado == this.estados.IDLE) {
      //CALCULO LOS VECTORES PARA LOS PASOS DE BOIDS, SI NO HAY TARGET
      vecAlineacion = this.alineacion(this.vecinos);
      vecCohesion = this.cohesion(this.vecinos);

      this.cambiarSprite("correr");
    }

    //PARA AMBOS ESTADOS: YENDO Y IDLE
    if (
      this.estado == this.estados.IDLE ||
      this.estado == this.estados.YENDO_AL_PLAYER
    ) {
      vecSeparacion = this.separacion(this.vecinos);

      //SUMO LOS VECTORES ANTES DE APLICARLOS
      sumaDeVectores.x += (vecSeparacion || {}).x || 0;
      sumaDeVectores.x += (vecAlineacion || {}).x || 0;
      sumaDeVectores.x += (vecCohesion || {}).x || 0;
      sumaDeVectores.x += (vecAtraccionAlPlayer || {}).x || 0;
      sumaDeVectores.x += (bordes || {}).x || 0;


      sumaDeVectores.y += (vecSeparacion || {}).y || 0;
      sumaDeVectores.y += (vecAlineacion || {}).y || 0;
      sumaDeVectores.y += (vecCohesion || {}).y || 0;
      sumaDeVectores.y += (vecAtraccionAlPlayer || {}).y || 0;
      sumaDeVectores.y += (bordes || {}).y || 0;


      this.aplicarFuerza(sumaDeVectores);
    }

    // ATANCANDO
    if (this.estado == this.estados.ATACANDO) {
      this.velocidad.x = 0;
      this.velocidad.y = 0;
      this.atacar();
    }

    if (this.estado == this.estados.RETROCEDIENDO) {
      const fuerzaDeAlejamiento = this.alejarseAlJugador();
      this.aplicarFuerza(fuerzaDeAlejamiento);
    }
  }

  update() {
    if (!this.listo) return;
    if (this.juego.contadorDeFrames % this.equipoParaUpdate == 0) {
      this.mirarAlrededor();
      this.segunDatosCambiarDeEstado();
      this.hacerCosasSegunEstado();
    }

    //USA EL METODO UPDATE Q ESTA EN LA CLASE DE LA CUAL HEREDA ESTA:
    super.update();
  }

  atacar() {
    //SI YA ESTABA ATANCANDO, NO CAMBIAR EL SPRITE
    if (this.spriteActual.startsWith("ataque")) return;

    this.cambiarSprite(
      "ataque" + (Math.floor(Math.random() * 2) + 1).toString()
    );
  }

  evaluarSiEstoyViendoAlPlayer() {
    const distanciaCuadrada = distanciaAlCuadrado(
      this.container.x,
      this.container.y,
      this.juego.player.container.x,
      this.juego.player.container.y
    );

    if (distanciaCuadrada < this.vision ** 2) {
      return true;
    }
    return false;
  }

  atraccionAlJugador() {
    const vecDistancia = new PIXI.Point(
      this.juego.player.container.x - this.container.x,
      this.juego.player.container.y - this.container.y
    );

    let vecNormalizado = normalizarVector(vecDistancia.x, vecDistancia.y);

    vecDistancia.x = vecNormalizado.x;
    vecDistancia.y = vecNormalizado.y;
    return vecDistancia;
  }

  alejarseAlJugador() {
    const vecDistancia = new PIXI.Point(
      this.juego.player.container.x - this.container.x,
      this.juego.player.container.y - this.container.y
    );

    let distCuadrada = vecDistancia.x ** 2 + vecDistancia.y ** 2;

    const fuerzaAlejamiento = distCuadrada > 0 ? Math.min(5 / distCuadrada, 1) : 0;

    //Se va hacia el lado opuesto
    vecDistancia.x = -vecDistancia.x * fuerzaAlejamiento;
    vecDistancia.y = -vecDistancia.y * fuerzaAlejamiento; 
    return vecDistancia;
  }

  cohesion(vecinos) {
    const vecPromedio = new PIXI.Point(0, 0);
    let total = 0;

    vecinos.forEach((enemigo) => {
      vecPromedio.x += enemigo.container.x;
      vecPromedio.y += enemigo.container.y;
      total++;
    });

    if (total > 0) {
      vecPromedio.x /= total;
      vecPromedio.y /= total;

      // Crear un vector que apunte hacia el centro de masa
      vecPromedio.x = vecPromedio.x - this.container.x;
      vecPromedio.y = vecPromedio.y - this.container.y;

      vecPromedio.x *= 0.002;
      vecPromedio.y *= 0.002;
    }

    return vecPromedio;
  }

  separacion(vecinos) {
    const vecFuerza = new PIXI.Point(0, 0);

    vecinos.forEach((enemigo) => {
      const distancia = distanciaAlCuadrado(
        this.container.x,
        this.container.y,
        enemigo.container.x,
        enemigo.container.y
      );

      const dif = new PIXI.Point(
        this.container.x - enemigo.container.x,
        this.container.y - enemigo.container.y
      );
      dif.x /= distancia;
      dif.y /= distancia;
      vecFuerza.x += dif.x;
      vecFuerza.y += dif.y;
    });

    vecFuerza.x *= 2;
    vecFuerza.y *= 2;
    return vecFuerza;
  }

  alineacion(vecinos) {
    const vecPromedio = new PIXI.Point(0, 0);
    let total = 0;

    vecinos.forEach((enemigo) => {
      vecPromedio.x += enemigo.velocidad.x;
      vecPromedio.y += enemigo.velocidad.y;
      total++;
    });

    if (total > 0) {
      vecPromedio.x /= total;
      vecPromedio.y /= total;

      // Escalar para que sea proporcional a la velocidad máxima
      vecPromedio.x *= 0.2;
      vecPromedio.y *= 0.2;
    }

    return vecPromedio;
  }

  ajustarPorBordes() {
    let fuerza = new PIXI.Point(0, 0);

    if (this.container.x < 0) fuerza.x = -this.container.x;
    if (this.container.y < 0) fuerza.y = -this.container.y;
    if (this.container.x > this.juego.canvaswidth)
      fuerza.x = -(this.container.x - this.juego.canvaswidth);
    if (this.container.y > this.juego.canvasHeight)
      fuerza.y = -(this.container.y - this.juego.canvasHeight);

    // if(this.debug)console.log(fuerza)
    return fuerza;
  }
}
