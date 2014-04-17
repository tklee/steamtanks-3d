ig.module( 
	'plugins.box2d.entity'
)
.requires(
	'impact.entity',	
	'plugins.box2d.game'
)
.defines(function(){


ig.Box2DEntity = ig.Entity.extend({
	body: null,
	angle: 0,
	
	init: function( x, y , settings ) {
		this.parent( x, y, settings );
		
		// Only create a box2d body when we are not in Weltmeister
		if( !ig.global.wm ) { 
			this.createBody();
		}
	},
	
	createBody: function() {
		var bodyDef = new b2.BodyDef();
		bodyDef.position.Set(
			(this.pos.x + this.size.x / 2) * b2.SCALE,
			(this.pos.y + this.size.y / 2) * b2.SCALE
		);
		
		this.body = ig.world.CreateBody(bodyDef);
		
		var shapeDef = new b2.PolygonDef();
		shapeDef.SetAsBox(
			this.size.x / 2 * b2.SCALE,
			this.size.y / 2 * b2.SCALE
		);
		
		shapeDef.density = 1;
		//shapeDef.restitution = 0.0;
		//shapeDef.friction = 0.9;
		this.body.CreateShape(shapeDef);
		this.body.SetMassFromShapes();
	},
	
	update: function() {		
		var p = this.body.GetPosition();
		this.pos = {
			x: (p.x / b2.SCALE - this.size.x / 2),
			y: (p.y / b2.SCALE - this.size.y / 2 )
		};
		this.angle = this.body.GetAngle().round(2);
		
		if( this.currentAnim ) {
			this.currentAnim.update();
			this.currentAnim.angle = this.angle;
		}
	},
	
	kill: function() {
		ig.world.DestroyBody( this.body );
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

        if( ig.input.pressed('shoot') ) {
            ig.game.spawnEntity( EntityProjectile, this.pos.x, this.pos.y, {flipped: this.flipped} );
            ig.game.gamesocket.send('spawnSimpleEntity', {
                ent: "EntityProjectile",
                x: this.pos.x,
                y: this.pos.y,
                settings: {flipped: this.flipped}
            });
        }

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
    }
});
	
});