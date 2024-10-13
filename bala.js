// Asegúrate de que el archivo utils.js esté incluido en tu index.html antes de este script

class Bala extends Objeto {
  constructor(x, y, juego, velX, velY) {
    super(x, y, 20, juego);
    this.velocidad.x = velX;
    this.velocidad.y = velY;

    this.juego = juego;
    this.grid = juego.grid; // Referencia a la grid
    this.vision = 2;
    // Cargar la textura del sprite desde el <img>
    this.sprite = new PIXI.Sprite();
    this.sprite.texture = PIXI.Texture.from("./bala.png");
    this.container.addChild(this.sprite);

    // Asegurarse de que el tamaño sea 25x25
    this.sprite.width = 10;
    this.sprite.height = 10;

    this.juego.app.stage.addChild(this.container);
  }

  update() {
    super.update();

    if (
      this.container.x < 0 ||
      this.container.y > this.juego.canvasHeight ||
      this.container.y < 0 ||
      this.container.x > this.juego.canvasWidth 
    ) {
      this.borrar();
    }

    let objs = Object.values(
      (this.miCeldaActual || {}).objetosAca || {}
    ).filter((k) => k instanceof Enemigo);
    if (objs.length > 0) {
      let distMin = 99999;
      let cual = null;
      for (let i = 0; i < objs.length; i++) {
        let dist = calculoDeDistanciaRapido(
          this.container.x,
          this.container.y,
          objs[i].container.x,
          objs[i].container.y
        );
        if (dist < distMin) {
          distMin = dist;
          cual = i;
        }
      }
      //si encontro un enemigo
      if (cual != null) {
        objs[cual].recibirTiro();
        this.borrar();
      }
    } 
  } 
}
