// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("main");
  }

  init() {
    //inicializar variables
    this.gameOver= false; //gameover
    this.timer= 30; //contador
    this.score = 0; //contador de score
    this.figuras = { //grupo de figuras con su valor
      "triangulo": {puntos: 10, cantidad: 0},
      "cuadrado": {puntos: 20, cantidad: 0},
      "rombo": {puntos: 30, cantidad: 0},
      "bomb": {puntos: -10, cantidad: 0},
    };
  }

  preload() {
    // cargar assets

    //import Cielo
    this.load.image("cielo","./public/assets/Cielo.webp");

    //import plataforma
    this.load.image("plataforma","./public/assets/platform.png");

    //import personaje
    this.load.spritesheet("personaje","./public/assets/ninja_anim.png", {frameWidth: 32, frameHeight: 32});

    //import recolectables
    this.load.image("rombo", "./public/assets/naranja.png");
    
    this.load.image("cuadrado", "./public/assets/manzana.png");

    this.load.image("triangulo", "./public/assets/pera.png");
    
    this.load.image("bomb", "./public/assets/bomb.png");
  }

  create() {  //Todo lo que se agrega en la pantalla va aquí
    //crear elementos

    this.anims.create({ //crear animación
      key:"quieto",
      frames: this.anims.generateFrameNumbers("personaje", {start:0,end:4}), //Frames de inicio y fin
      frameRate:6, //Velocidad de fps
      repeat:-1 //-1 significa infinito
    })

    this.anims.create({
      key:"caminar",
      frames: this.anims.generateFrameNumbers("personaje", {start:6,end:8}),
      frameRate:6,
      repeat:-1
    })

    this.anims.create({
      key:"salto",
      frames: this.anims.generateFrameNumbers("personaje", {start:10,end:12}),
      frameRate:6,
      repeat:-1
    })

    this.cielo = this.add.image(400,300, "cielo");
    this.cielo.setScale(2);

    //crea grupo plataforma
    this.plataformas = this.physics.add.staticGroup()
    //al grupo de plataformas agregar una plataforma
    this.plataformas.create(400,568,"plataforma").setScale(2).refreshBody();

    this.plataformas.create(300,350,"plataforma").refreshBody();

    //crear personaje //.image aqui porque es una imagen sin animacion, y .sprite cuando es algo con animacion
    this.personaje = this.physics.add.sprite(400,300, "personaje").setScale(3); //(fisicas, coordenadas, "key")
    this.personaje.setSize(18, 22);
    this.personaje.setCollideWorldBounds(true); //Activar colision

    //agregar colision entre personaje y plataforma   // una version alternativa de agregar colision a plataformas / objetos (this.plataforma.setCollideWorldBounds(true))
    this.physics.add.collider(this.personaje, this.plataformas);   
        

    //crea teclas // esto es para teclas como las flechas, la barra espaciadora y el enter
    this.cursor = this.input.keyboard.createCursorKeys();
    //agregar controles de teclado (w,d,s,a) uno a uno, se tiene que reemplazar la letra que va a ser por la que nueva letra, osea, tenes la W la cambias por la B
    //this.w = this.input.keyboard.addKey(Phaser.input)

    //crea grupo de recolectables/coleccionables
    this.recolectables = this.physics.add.group();
    //colision del personaje y los recolectables
    

    //agregar evento de 1 segundo
    this.time.addEvent({
      delay: 1000,
      callback: this.onSecond,
      callbackScope: this,
      loop: true,
    });

    //Agregar tecla R
    this.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    //evento 1 segundo del contador
    this.time.addEvent({
      delay:1000,
      callback: this.handlerTimer,
      callbackScope: this,
      loop: true,
    })

    //Agregar texto de timer en la esquina superior izquierda
    this.timerText = this.add.text(10, 10, `Tiempo restante: ${this.timer}` , {
      fontSize: "32px",
      fill:"#fff",
    })

    //Fisicas para que desaparezca el recolectable
    this.physics.add.collider (
      this.personaje,
      this.recolectables,
      this.onShapeCollect,
      null,
      this
    );

    this.physics.add.collider (
      this.recolectables,
      this.plataformas,
      this.onRecolectableBounced,
      null,
      this
    );

    this.scoreText = this.add.text ( //Texto de contador de puntos
      10,
      50,
      `Puntaje: ${this.score}
      T: ${this.figuras["triangulo"].cantidad}
      C: ${this.figuras["cuadrado"].cantidad}
      R: ${this.figuras["rombo"].cantidad}`
    );

  }

  onSecond() {
    //crear respawneo recolectable
    const tipos = ["triangulo","cuadrado","rombo", "bomb"];
    const tipo = Phaser.Math.RND.pick(tipos); //aleatoridad de elementos que aparecen
    let recolectable = this.recolectables.create(
      Phaser.Math.Between(10, 790),
      0,
      tipo
    );
    recolectable.setVelocity(0, 100);
    recolectable.setScale(3);
    
    const rebote = Phaser.Math.FloatBetween(0.4, 0.8); //determinar cuanto rebote
    recolectable.setBounce(rebote); //rebote

    recolectable.setData("puntos", this.figuras[tipo].puntos); //Setear datos de puntos
    recolectable.setData("tipo", tipo); //Setear datos de tipos de recolectables

  }

  update() {
    //movimiento del personaje
    if (this.cursor.left.isDown) {
      this.personaje.setVelocityX(-200);
      this.personaje.anims.play("caminar", true); //reproducir animación usando su "key"
      this.personaje.flipX=true; //invertir la animación para ir al otro lado

    } else if (this.cursor.right.isDown){
      this.personaje.setVelocityX(200);
      this.personaje.anims.play("caminar", true);
      this.personaje.flipX=false;

    } else {
      this.personaje.setVelocityX(0);
      this.personaje.anims.play("quieto", true);
    }
    if (this.cursor.up.isDown && this.personaje.body.touching.down) {
      this.personaje.setVelocityY(-330);
      this.personaje.anims.play("salto", true);
      }

  //Activar Game Over

    if(this.gameOver && this.r.isDown) { //activar reinicio
    this.scene.restart();
      }

      if (this.gameOver) { 
        //this.physics.pause(); //pausar pantalla cuando se activa Game Over
        this.scene.start("end", {
        score: this.score,
        gameOver: this.gameOver,
        });
        //return; //Hace una salida de la funcion para que no se vuelva a ejecutar
      }

        
        }

//Colision entre el personaje y el recolectable
onShapeCollect(personaje, recolectable) {
  console.log("Recolectado" , recolectable.texture.key);

  const nombrefig = recolectable.getData("tipo"); //Obtener datos de recolectable
  const puntosfig = recolectable.getData("puntos"); //Obtener datos de puntos
  this.score += puntosfig; //Sumar los puntos de la figura al score
  console.log(this.score);
  this.figuras[nombrefig].cantidad += 1;

  console.table(this.figuras);
  console.log("score", this.score);
  recolectable.destroy(); //Desaparecer el recolectable al chocar con el personaje

  this.scoreText.setText( //score
    `Puntaje: ${this.score}
    T: ${this.figuras["triangulo"].cantidad}
    C: ${this.figuras["cuadrado"].cantidad}
    R: ${this.figuras["rombo"].cantidad}`
  );

  const cumplePuntos = this.score >= 100;
  const cumpleFiguras = 
  this.figuras["triangulo"].cantidad >= 2 &&
  this.figuras["cuadrado"].cantidad >= 2 &&
  this.figuras["rombo"].cantidad >= 2;

  if (cumplePuntos && cumpleFiguras) { //Ganar
    console.log("Ganaste");
    this.scene.start("end", {
      score: this.score,
      gameOver: this.gameOver,
    });
    
  }
}

handlerTimer(){
  this.timer -= 1; //contador de tiempo
    this.timerText.setText(`tiempo restante: ${this.timer}`);
    if(this.timer === 0){
      this.gameOver = true;
    }
}

onRecolectableBounced(recolectable, plataforma) {
  //recolectable rebote
  let puntos = recolectable.getData("puntos");
  puntos -= 5; //restar 5 puntos por rebote
  recolectable.setData("puntos", puntos);
  if(puntos <= 0) {
    recolectable.destroy();
  }
}
}