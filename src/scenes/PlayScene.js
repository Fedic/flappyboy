
import Phaser from 'phaser';

const PIPES_TO_RENDER = 4;
const PAUSE_BUTTON_SCALE = 3;
const NEW_SCENE_BUTTON_SCALE = 2;
const NEW_SCENE_BUTTON_Y_OFFSET = 550;
const PIPE_VERTICAL_OFFSET = 20;

class PlayScene extends Phaser.Scene {

    constructor(config) {
        super('PlayScene');
        this.config = config;

        this.bird = null;
        this.pipes = null;

        this.pipeHorizontalDistance = 0;

        this.pipeVerticalDistanceRange = [150, 250];
        this.pipeHorizontalDistanceRange = [500, 550];
        this.flapVelocity = 300;

        this.score = 0;
        this.scoreText = " ";
    }

    create() {
        this.createBG();
        this.createBird();
        this.createPipes();
        this.createColliders();
        this.createScore();
        this.createPause();
        this.handleInputs();
        this.createNewScene();
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    createBG() {
        this.add.image(0, 0, 'space').setOrigin(0);
    }

    createBird() {
        this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird').setOrigin(0);
        this.bird.body.gravity.y = 600;
        this.bird.setCollideWorldBounds(true);
    }

    createPipes() {
        this.pipes = this.physics.add.group();

        for (let i = 0; i < PIPES_TO_RENDER; i++) {
          const upperPipe = this.pipes.create(0, 0, 'pipe')
            .setImmovable(true)
            .setOrigin(0, 1);
          const lowerPipe = this.pipes.create(0, 0, 'pipe')
            .setImmovable(true)
            .setOrigin(0, 0);
      
          this.placePipe(upperPipe, lowerPipe);
        }
      
        this.pipes.setVelocityX(-200);
    }

    createColliders() {
        this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
    }

    createScore() {
        this.score = 0;
        const bestScore = localStorage.getItem('bestScore');
        this.scoreText = this.add.text(this.config.width * .02, this.config.height * .02, `Score: ${0}`, { fontSize: '32px', fill: '#000'});
        this.add.text(this.config.width * .02, this.config.height * .08, `Best Score: ${bestScore || 0}`, { fontSize: '18px', fill: '#000'});
    }

    createPause() {
        const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause')
            .setInteractive()
            .setScale(PAUSE_BUTTON_SCALE)
            .setOrigin(1);

        pauseButton.on('pointerdown', () => {
            this.physics.pause();
            this.scene.pause();
        })
    }

    createNewScene() {
        const newButton = this.add.image(this.config.width - 10, this.config.height - 550, 'back')
            .setInteractive()
            .setScale(NEW_SCENE_BUTTON_SCALE)
            .setOrigin(1);

        newButton.on('pointerdown', () => {
            this.scene.start('NewScene');
        })
    }

    handleInputs() {
        this.input.on('pointerdown', this.flap, this);
        this.input.keyboard.on('keydown_SPACE', this.flap, this);
        this.input.keyboard.on('keydown_J', this.flap, this);
    }

    checkGameStatus() {
        if (this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
            this.gameOver();
        }
    }

    placePipe(uPipe, lPipe){
        const rightMostX = this.getRightMostPipe();
        const pipeVerticalDistance = Phaser.Math.Between(...this.pipeVerticalDistanceRange);
        const pipeVerticalPosition = Phaser.Math.Between(0 + PIPE_VERTICAL_OFFSET, this.config.height - PIPE_VERTICAL_OFFSET - pipeVerticalDistance);
        const pipeHorizontalDistance = Phaser.Math.Between(...this.pipeHorizontalDistanceRange);
      
        uPipe.x = rightMostX + pipeHorizontalDistance;
        uPipe.y = pipeVerticalPosition;
      
        lPipe.x = uPipe.x;
        lPipe.y = uPipe.y + pipeVerticalDistance;
    }
      
    recyclePipes() {
        const tempPipes = [];
        this.pipes.getChildren().forEach(pipe => {
          if (pipe.getBounds().right <= 0){
            tempPipes.push(pipe);
            if (tempPipes.length === 2) {
              this.placePipe(...tempPipes);
              this.increaseScore();
              this.saveBestScore();
            }
          }
        })
    }

    getRightMostPipe() {
        let rightMostX = 0;
      
        this.pipes.getChildren().forEach(function(pipe){
          rightMostX = Math.max(pipe.x, rightMostX);
        })
      
        return rightMostX;
    }

    saveBestScore() {
        const bestScoreText = localStorage.getItem('bestScore');
        const bestScore = bestScoreText && parseInt(bestScoreText, 10);

        if (!bestScore || this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
        }
    }
      
    gameOver() {
        this.physics.pause();
        this.bird.setTint(0xff0000);

        this.saveBestScore();

        this.time.addEvent({
            delay: 1000,
            callback: () => {
               this.scene.restart();     
            },
            loop: false
        })
    }
      
    flap() {
        this.bird.body.velocity.y = -this.flapVelocity;
    }

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }
}

export default PlayScene;