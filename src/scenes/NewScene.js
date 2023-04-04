import Phaser from 'phaser';

class NewScene extends Phaser.Scene {

    constructor(config) {
        super('NewScene');
        this.config = config;
    }

    create() {
        this.add.image(0, 0, 'MC').setOrigin(0);
    }
}
export default NewScene;