ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityPlayer = ig.Box2DEntity.extend({
	size: {x: 8, y:16},
	offset: {x: 4, y: 0},

	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

	animSheet: new ig.AnimationSheet( 'media/player.png', 16, 24 ),

	flip: false,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		// Add the animations
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'jump', 0.07, [1,2] );
	},


	update: function() {

        if(this.handlesInput){
            this.initKeys();
        };

		// move left or right
		if( ig.input.state('left') ) {
			this.body.ApplyForce( new b2.Vec2(-20,0), this.body.GetPosition() );
			this.flip = true;
		}
		else if( ig.input.state('right') ) {
			this.body.ApplyForce( new b2.Vec2(20,0), this.body.GetPosition() );
			this.flip = false;
		}

		// jetpack
		if( ig.input.state('jump') ) {
			this.body.ApplyForce( new b2.Vec2(0,-30), this.body.GetPosition() );
			this.currentAnim = this.anims.jump;
		}
		else {
			this.currentAnim = this.anims.idle;
		}

		// shoot
		if( ig.input.pressed('shoot') ) {
            console.log('player has shot...');
            /*
			var x = this.pos.x + (this.flip ? -6 : 6 );
			var y = this.pos.y + 6;
			ig.game.spawnEntity( EntityProjectile, x, y, {flip:this.flip} );
			*/
		}

		this.currentAnim.flip.x = this.flip;


		// This sets the position and angle. We use the position the object
		// currently has, but always set the angle to 0 so it does not rotate
		this.body.SetXForm(this.body.GetPosition(), 0);

		// move!
		this.parent();
	},

    broadcastPosition: function(){
        ig.game.gamesocket.send('move', {
            pos: this.pos,
            remoteAnim: this.remoteAnim,
            remoteId: this.remoteId,
            flipped: this.flipped
        });
    },

    initKeys: function(){

        if( ig.input.pressed('jump') ) {
            this.vel.y = -100;
        }
        /*
        if( ig.input.pressed('shoot') ) {
            ig.game.spawnEntity( EntityProjectile, this.pos.x, this.pos.y, {flipped: this.flipped} );
            ig.game.gamesocket.send('spawnSimpleEntity', {
                ent: "EntityProjectile",
                x: this.pos.x,
                y: this.pos.y,
                settings: {flipped: this.flipped}
            });
        }
        */

        /*
        var accel = 100;
        if(ig.input.state('left') ){
            this.accel.x = -accel;
            this.flipped = true;
        }else if(ig.input.state('right') ){
            this.accel.x = accel;
            this.flipped = false;
        }else{
            this.accel.x = 0;
        }

        // animations
        if( this.vel.y < 0 ) {
            this.currentAnim = this.anims.jump;
            this.broadcastPosition();
            this.remoteAnim = "jump";
        }else if( this.vel.y > 0 ) {
            this.currentAnim = this.anims.fall;
            this.broadcastPosition();
            this.remoteAnim = "fall";
        }else if( this.vel.x != 0 ) {
            this.currentAnim = this.anims.run;
            this.broadcastPosition();
            this.remoteAnim = "run";
        }else {
            this.currentAnim = this.anims.idle;
            if(this.remoteAnim != "idle"){
                this.remoteAnim = "idle";
                this.broadcastPosition();
            }
        }

        this.currentAnim.flip.x = this.flipped;
        */
    },

    kill: function(){
        this.pos.x = 40;
        this.pos.y = 64;
        ig.game.gamesocket.announce({text: this.remoteId+" got killed!"});
        this.health = 20;
        //this.parent();
    },

    handleMovementTrace: function( res ) {
        this.parent(res);
    }
});


EntityProjectile = ig.Box2DEntity.extend({
	size: {x: 40, y: 15},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

	animSheet: new ig.AnimationSheet( 'media/projectile.png', 30, 20 ),

	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this.addAnim( 'idle', 1, [0] );
		this.currentAnim.flip.x = settings.flip;

		var velocity = (settings.flip ? -10 : 10);
		this.body.ApplyImpulse( new b2.Vec2(velocity,0), this.body.GetPosition() );
	},

    handleMovementTrace: function( res ) {
        this.parent( res );
        if( res.collision.x || res.collision.y ) {
            this.kill();
        }
    },

    check: function( other ) {
        other.receiveDamage( 10, this );
        this.kill();
    }
});

});
