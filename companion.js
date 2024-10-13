class Companion extends Objeto {
    constructor(x, y, juego) {
        super(x, y, 3, juego);
        this.velocidadMaximaOriginal = 3;
        this.juego = juego;
        this.grid = juego.grid;

        this.cargarVariosSpritesAnimados(
            {
                idle: "./img/companion_idle.png",
            },
            16,
            16,
            0.2,
            (e) => {
                this.listo = true;
                this.cambiarSprite("idle");
            }
        );
    }


    disparar() {
        let angulo = Math.atan2(
            this.juego.mouse.x - this.app.stage.x - this.container.x,
            this.juego.mouse.y - this.app.stage.y - this.container.y
        );
        this.juego.balas.push(
            new Bala(
                this.container.x,
                this.container.y,
                this.juego,
                Math.sin(angulo),
                Math.cos(angulo)
            )
        );

        this.velocidad.x = 0;
        this.velocidad.y = 0;
    }

    update() {
        if (!this.listo) return;
        this.cambiarSprite("idle");
        this.companionBounce(juego.contadorDeFrames, { x: juego.player.container.x, y: juego.player.container.y });
        super.update();
    }

    companionBounce(frame,player) { //hace que el compañero gire al rededor del Player
        let frames = frame;
        let playerPos = player;
        const radius = 40; // Radio
        const speed = 0.01; //Velocidad

        // Calcular la nueva posición usando trigonometría (gracias chatgpt)
        const angle = frames * speed;
        this.container.x = playerPos.x + Math.cos(angle) * radius;
        this.container.y = playerPos.y + Math.sin(angle) * radius;
    }
}

