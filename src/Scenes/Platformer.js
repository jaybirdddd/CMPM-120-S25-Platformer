
// Platformer.js
class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 400;
        this.DRAG = 500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.score = 0;
    }

    create() {
        // Ensure shared object containers exist
        if (!my.sprite) my.sprite = {};
        if (!my.vfx) my.vfx = {};
        this.ChompingSound = this.sound.add("ChompingSound");
        // Set gravity here instead of globally
        this.physics.world.gravity.y = 1500;

        // Corrected tilemap creation (removed unnecessary parameters)
        this.map = this.add.tilemap("platformer-level-1");
        // Corrected tileset name to match Tiled's tileset name
        this.tileset = this.map.addTilesetImage("food-compressed", "tilemap_tiles");
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ Collides: true });
        this.levelExtras = this.map.createLayer("Level Extras", this.tileset, 0, 0);
        this.food = this.map.createFromObjects("Food-Collectibles", {
            key: "tilemap_sheet",
            frame: 120
        });
        
        this.physics.world.enable(this.food, Phaser.Physics.Arcade.STATIC_BODY);
        this.foodGroup = this.add.group(this.food);

        my.sprite.player = this.physics.add.sprite(30, 30, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.physics.add.overlap(my.sprite.player, this.foodGroup, (obj1, obj2) => {
            obj2.destroy();
            this.score += 100;
            this.ChompingSound.play();
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        });

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_05.png', 'smoke_03.png'],
            scale: { start: 0.03, end: 0.1 },
            lifespan: 450,
            alpha: { start: 1, end: 0.3 }
        });
        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_07.png', 'smoke_04.png'],
            scale: { start: 0.03, end: 0.1 },
            lifespan: 250,
            alpha: { start: 1, end: 0.1 },
            duration: 350
        });
        my.vfx.jumping.stop();
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }

    update() {
        if (this.cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else if (this.cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        if(this.score == 800) {
            this.add.text(400, 15, "You win! Press R to restart.", {
            fontFamily: 'Times, serif',
            fontSize: 24,
        });        }
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.jumping.start();
            }
        }


        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            //this.scene.resume();
            this.scene.restart();
            my.sprite.player.x = 30;
            my.sprite.player.y = 30;
            this.score = 0;
        }
    }

    
}