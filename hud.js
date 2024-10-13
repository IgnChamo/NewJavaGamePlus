class HUD{
    constructor(juego){
        this.juego = juego;
        this.container = new PIXI.Container()
        this.container.visible = true;
        this.container.zIndex = 9999999;

        this.juego.hudContainer.addChild(this.container);

        this.puntaje = new PIXI.Text("Puntaje",{fontFamily: 'fuente', fontSize: 50, fill: 0x000000});

        this.puntaje.position.set(100,100);

        this.container.addChild(this.puntaje);
        console.log("Se creo el hud");
    }
    actualizarHud(){
        this.puntaje.text = "Puntaje: " + this.juego.player.asesinatos;
    }
}