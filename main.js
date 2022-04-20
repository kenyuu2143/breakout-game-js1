"use strict";

class Rectangle
{
	constructor( x, y, width, height )
	{
		this.mWidth = width;
		this.mHeight = height;
	}

	contains( x, y )
	{
		return( this.mX <= x && x < this.mX + this.mWidth &&
		        this.mY <= y && y < this.mY + this.mHeight );
	}

	get pCX()
	{
		return( this.mX + this.mWidth / 2 );
	}
	set pCX( value )
	{
		this.mX = value - this.mWidth / 2;
	}

	get pCY()
	{
		return( this.mY + this.mHeight / 2 );
	}
	set pCY( value )
	{
		this.mY = value - this.mHeight / 2;
	}
}


const WIDTH = 720;
const HEIGHT = 540;
const MESH = 24;
const MAG = 3;
const COLUMN = 14;
const ROW = 8;
const PALETTE = [ "#ff0000", "#ff00ff", "#00ff00", "#ffff00" ];


var gBreak = [];
var gScore = 0;
var gLife = 3;
var gWait;
var gSE = [];

class Ball extends Rectangle
{
	constructor()
	{
		super( 0, 0, MAG * 4, MAG * 4 );
	}

	draw( g )
	{
		g.fillStyle = "#ffffff";
		g.fillRect( this.mX, this.mY, this.mWidth, this.mHeight );
	}

	move()
	{
		this.mX += this.mDX;
		this.mY += this.mDY;

		if( gPlayer.contains( this.mX, this.mY ) ){
			gSE[ 0 ].currentTime = 0;
			gSE[ 0 ].play();
			let		a = Math.atan2( this.pCY - gPlayer.pCY, this.pCX - gPlayer.pCX );
			this.mDX = Math.cos( a );
			this.mDY = Math.sin( a );
			this.mDY = Math.min( this.mDY, -0.25 );
			this.mY += this.mDY;
			this.mSpeed++;
		}

		let		x = Math.floor( ( this.pCX - MESH ) / ( MESH * 2 ) );
		let		y = Math.floor( ( this.pCY - MESH * 3 ) / MESH );
//console.log( "x=" + x + " y=" + y );
		if( x >= 0 && x < COLUMN &&
		    y >= 0 && y < ROW ){
			let		i = y * COLUMN + x;
			if( !gBreak[ i ] ){
				gBreak[ i ] = 1;
				gSE[ 1 ].currentTime = 0;
				gSE[ 1 ].play();
				gScore++;
				let		dx = Math.abs( this.pCX - ( x + 1 ) * MESH * 2 );
				let		dy = Math.abs( this.pCY - ( y + 3.5 ) * MESH );
				if( dx < dy * 2 ){
					this.mDY = -this.mDY;
				}else{
					this.mDX = -this.mDX;
				}
			}
		}

		if( this.pCX < MESH || this.pCX > WIDTH - MESH ){
			this.mDX = -this.mDX;
			gSE[ 2 ].currentTime = 0;
			gSE[ 2 ].play();
		}

		if( this.pCY < MESH ){
			this.mDY = -this.mDY;
			gSE[ 2 ].currentTime = 0;
			gSE[ 2 ].play();
		}
	}

	start()
	{
		this.pCX = WIDTH / 2;
		this.pCY = MESH * 12;
		this.mDX = Math.random() / 5 - 0.1;
		this.mDY = 1;
		this.mSpeed = 32;
	}

	tick()
	{
		for( let i = 0; i < this.mSpeed / 4; i++ ){
			this.move();
		}

		if( this.mY > HEIGHT ){
			if( !--gLife ){
				return;
			}
			start();
		}
	}
}

var	gBall = new Ball();

class Player extends Rectangle
{
	constructor()
	{
		super( 0, 0, MESH * 2, MESH );
	}

	draw( g )
	{
		DrawBlock( g, this.mX, this.mY, "#00ffff" );
	}

	start()
	{
		this.pCX = WIDTH / 2;
		this.pCY = HEIGHT - MESH * 2;
	}

	tick()
	{
		this.mX = Math.max( MESH             , this.mX - gKey[ 37 ] * MAG * 4 );
		this.mX = Math.min( WIDTH - MESH * 2 , this.mX + gKey[ 39 ] * MAG * 4 );
//		this.mY = Math.max( MESH             , this.mY - gKey[ 38 ] * MAG * 4 );
//		this.mY = Math.min( HEIGHT - MESH * 2, this.mY + gKey[ 40 ] * MAG * 4 );
	}
}

var	gPlayer = new Player();

function DrawBlock( g, x, y, style )
{
	g.fillStyle = style;
	g.fillRect( x + MAG, y + MAG, MESH * 2 - MAG * 2, MESH - MAG * 2 );
}

function draw()
{
	let	g = document.getElementById( "main" ).getContext( "2d" );

	g.fillStyle = "#ffffff";
	g.fillRect( 0, 0, WIDTH, HEIGHT );
	g.fillStyle = "#000000";
	g.fillRect( MESH - MAG, MESH - MAG, WIDTH - MESH * 2 + MAG * 2, HEIGHT - MESH + MAG * 2 );

	for( let y = 0; y < ROW; y++ ){
		for( let x = 0; x < COLUMN; x++ ){
			if( !gBreak[ y * COLUMN + x ] ){
				DrawBlock( g, MESH * ( x * 2 + 1 ), ( y + 3 ) * MESH, PALETTE[ y >> 1 ] );
			}
		}
	}

	gPlayer.draw( g );

	g.font = "36px monospace";
	g.fillStyle = "#ffffff";
	g.fillText( "SCORE " + gScore, MESH * 2, MESH * 2.5 );
	g.fillText( "LIFE " + gLife, MESH * 23, MESH * 2.5 );

	if( gLife <= 0 ){
		g.fillText( "GAME OVER", WIDTH / 2 - MESH * 3, HEIGHT / 2 + MESH );
	}

	if( gScore == COLUMN * ROW ){
		g.fillText( "GAME CLEAR!", WIDTH / 2 - MESH * 3, HEIGHT / 2 + MESH );
	}

	gBall.draw( g );
}

function load()
{
	let	s = [ "se1.mp3", "se2.mp3", "se3.mp3" ];
	for( let i = 0; i < s.length; i++ ){
		gSE[ i ] = new Audio();
		gSE[ i ].volume = 0.1;
		gSE[ i ].src = s[ i ];
	}
}

function start()
{
	gWait = 60;
	gPlayer.start();
	gBall.start();
}

function tick()
{
	if( !gLife ){
		return;
	}

	if( gScore == COLUMN * ROW ){
		return;
	}

	gPlayer.tick();

	if( gWait ){
		gWait--;
		return;
	}

	gBall.tick();
}

//	======================== 01_avoid ================================

const TIMER_INTERVAL = 33;

var gKey = new Uint8Array( 0x100 );
var gTimer;

//	描画イベント
function onPaint()
{
	if( !gTimer ){
		gTimer = performance.now();
	}

	if( gTimer + TIMER_INTERVAL < performance.now() ){
		gTimer += TIMER_INTERVAL;
		tick();
		draw();
	}

	requestAnimationFrame( onPaint );
}

//	キーを押したときのイベント
window.onkeydown = function( ev )
{
	gKey[ ev.keyCode ] = 1;
}

//	キーを離した時のイベント
window.onkeyup = function( ev )
{
	gKey[ ev.keyCode ] = 0;
}

//	起動時のイベント
window.onload = function()
{
	load();
	start();

	requestAnimationFrame( onPaint );
}
