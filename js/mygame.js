//Declare my variables

var canvas;
var context;
var timer;
var interval;
var player;

// Game status flags
var inGrass = false;
var encounter = false;

// Transition variables
var transitionActive = false;
var bars = [];
var barsInitialized = false;
var resetGameTriggered = false;

canvas = document.getElementById("canvas");
context = canvas.getContext("2d");	

player = new GameObject({x:100, y:canvas.height/2-100});

platform0 = new GameObject();
platform0.width = 200;
platform0.x = platform0.width/2;
platform0.y = canvas.height - platform0.height/2;
platform0.color = "#ff66cc";

platform1 = new GameObject();
platform1.width = 200; 
platform1.x = 300 + platform1.width/2; 
platform1.y = canvas.height - 150; 
platform1.color = "#ffcc00"; 

platform2 = new GameObject();
platform2.width = 200;
platform2.x = 600 + platform2.width/2;
platform2.y = canvas.height - 250;
platform2.color = "#ff6600";

platform3 = new GameObject();
platform3.width = 200;
platform3.x = 900 + platform3.width/2;
platform3.y = canvas.height - 350;
platform3.color = "#66ccff";

platform4 = new GameObject();
platform4.width = 200;
platform4.x = 900 + platform4.width/2;
platform4.y = canvas.height - 550;
platform4.color = "#9166ff";

platform5 = new GameObject();
platform5.width = 200;
platform5.x = 450 + platform5.width/2; 
platform5.y = canvas.height - 400;     
platform5.color = "#66ff33"; 
	
goal = new GameObject({width:24, height:50, x:canvas.width-50, y:100, color:"#00ffff"});

// Handle Menu Interaction Clicks during a Battle
window.addEventListener("mousedown", function(e) {
	if (gameState !== "battle") return;

	// Calculate mouse positions relative to canvas
	var rect = canvas.getBoundingClientRect();
	var mouseX = e.clientX - rect.left;
	var mouseY = e.clientY - rect.top;

	// Simple click box detection matching our text layout zones
	if (mouseY > canvas.height - 150) {
		if (mouseX > canvas.width / 2 && mouseX < canvas.width * 0.75) {
			if (mouseY < canvas.height - 70) {
				// Clicked FIGHT
				enemyHP -= 5; 
				if (enemyHP <= 0) {
					endBattleAndReturn();
				}
			} else {
				// Clicked ITEM (Does nothing for now)
			}
		} else if (mouseX >= canvas.width * 0.75) {
			if (mouseY < canvas.height - 70) {
				// Clicked PARTY (Does nothing for now)
			} else {
				// Clicked RUN
				endBattleAndReturn();
			}
		}
	}
});

// Helper function to return smoothly back to overworld map
function endBattleAndReturn() {
	gameState = "overworld";
	player.x = overworldSavedX;
	player.y = overworldSavedY;
	player.vx = 0;
	player.vy = 0;
	encounter = false;
	transitionActive = false;
	barsInitialized = false;
	resetGameTriggered = false;
	bars = [];
}

var fX = .85;
var fY = .85;

var gravity = 0;

interval = 1000/60;
timer = setInterval(animate, interval);

// Function to reset the game data safely
function resetGameData() {
	player.x = 100;
	player.y = canvas.height / 2 - 100;
	player.vx = 0;
	player.vy = 0;
	encounter = false;
	transitionActive = false;
	barsInitialized = false;
	resetGameTriggered = false;
	bars = [];
}

function animate()
{
	context.clearRect(0,0,canvas.width, canvas.height);	

	// 1. Reset standard friction values
	fX = .85;
	fY = .85;
	
	inGrass = false;

	// 2. Apply standard movement inputs ONLY if no active encounter
	if (!encounter) {
		if(w) { player.vy += -player.ay * player.force; }
		if(s) { player.vy += player.ay * player.force; }
		if(a) { player.vx += -player.ax * player.force; }
		if(d) { player.vx += player.ax * player.force; }
	}

	// 3. Grass checks
	var checkBottom = true;
	var checkLeft = true;
	var checkRight = true;
	var checkTop = true;

	while(platform5.hitTestPoint(player.bottom()) && checkBottom) { inGrass = true; checkBottom = false; }
	while(platform5.hitTestPoint(player.left()) && checkLeft)     { inGrass = true; checkLeft = false; }
	while(platform5.hitTestPoint(player.right()) && checkRight)   { inGrass = true; checkRight = false; }
	while(platform5.hitTestPoint(player.top()) && checkTop)       { inGrass = true; checkTop = false; }

	// 4. Encounter Probability Logic
	if (inGrass && !encounter && !transitionActive) {
		var isPressingMoveKey = w || s || a || d;
		if (isPressingMoveKey) {
			if (Math.random() < 0.05) {
				encounter = true;
				transitionActive = true;
			}
		}
	}

	// 5. Freeze positioning elements if encounter triggers
	if (encounter) {
		fX = 0;
		fY = 0;
		player.vx = 0;
		player.vy = 0;
	}

	// 6. Physics calculations
	player.vx *= fX;
	player.vy *= fY;
	player.vy += gravity;
	player.x += Math.round(player.vx);
	player.y += Math.round(player.vy);
	
	// Solid platform collisions
	while(platform0.hitTestPoint(player.bottom()) && player.vy >=0) { player.y--; player.vy = 0; player.canJump = true; }
	while(platform0.hitTestPoint(player.left()) && player.vx <=0)   { player.x++; player.vx = 0; }
	while(platform0.hitTestPoint(player.right()) && player.vx >=0)  { player.x--; player.vx = 0; }
	while(platform0.hitTestPoint(player.top()) && player.vy <=0)    { player.y++; player.vy = 0; }
	
	while(platform1.hitTestPoint(player.bottom()) && player.vy >=0) { player.y--; player.vy = 0; player.canJump = true; }
	while(platform1.hitTestPoint(player.left()) && player.vx <=0)   { player.x++; player.vx = 0; }
	while(platform1.hitTestPoint(player.right()) && player.vx >=0)  { player.x--; player.vx = 0; }
	while(platform1.hitTestPoint(player.top()) && player.vy <=0)    { player.y++; player.vy = 0; }
	
	while(platform2.hitTestPoint(player.bottom()) && player.vy >=0) { player.y--; player.vy = 0; player.canJump = true; }
	while(platform2.hitTestPoint(player.left()) && player.vx <=0)   { player.x++; player.vx = 0; }
	while(platform2.hitTestPoint(player.right()) && player.vx >=0)  { player.x--; player.vx = 0; }
	while(platform2.hitTestPoint(player.top()) && player.vy <=0)    { player.y++; player.vy = 0; }

	while(platform3.hitTestPoint(player.bottom()) && player.vy >=0) { player.y--; player.vy = 0; player.canJump = true; }
	while(platform3.hitTestPoint(player.left()) && player.vx <=0)   { player.x++; player.vx = 0; }
	while(platform3.hitTestPoint(player.right()) && player.vx >=0)  { player.x--; player.vx = 0; }
	while(platform3.hitTestPoint(player.top()) && player.vy <=0)    { player.y++; player.vy = 0; }
	
	while(platform4.hitTestPoint(player.bottom()) && player.vy >=0) { player.y--; player.vy = 0; player.canJump = true; }

	// Goal handling
	if(player.hitTestObject(goal))
	{
		goal.y = 10000;
		context.textAlign = "center";
		context.drawText("You Win!!!", canvas.width/2, canvas.height/2);
	}
	
	// Draw standard stage elements
	platform0.drawRect();
	platform1.drawRect();
	platform2.drawRect();
	platform3.drawRect();
	platform4.drawRect();
	platform5.drawRect();
	player.drawRect();
	goal.drawCircle();

	// 7. [NEW] Cinematic Bar Transition Animation
	if (transitionActive) {
		var totalBars = 8;
		var barHeight = canvas.height / totalBars;

		// Initialize bars if they haven't been configured yet
		if (!barsInitialized) {
			for (var i = 0; i < totalBars; i++) {
				var fromLeft = (i % 2 === 0); // Alternate directions
				bars.push({
					y: i * barHeight,
					height: barHeight,
					width: 0,
					targetWidth: canvas.width,
					speed: 25, // Pixels per frame fly-in speed
					fromLeft: fromLeft
				});
			}
			barsInitialized = true;
		}

		var allBarsFinished = true;

		// Update and draw each cinematic bar layer
		context.fillStyle = "#000000";
		for (var i = 0; i < bars.length; i++) {
			var b = bars[i];
			
			if (b.width < b.targetWidth) {
				b.width += b.speed;
				if (b.width > b.targetWidth) b.width = b.targetWidth;
				allBarsFinished = false; // Transition still running
			}

			// Render from the designated border line direction
			if (b.fromLeft) {
				context.fillRect(0, b.y, b.width, b.height);
			} else {
				context.fillRect(canvas.width - b.width, b.y, b.width, b.height);
			}
		}

		// When total blackout is reached, reset the game state
		if (allBarsFinished && !resetGameTriggered) {
			resetGameTriggered = true;
			resetGameData();
		}
	}
}
