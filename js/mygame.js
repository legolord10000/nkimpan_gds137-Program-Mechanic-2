var canvas;
var context;
var timer;
var interval;
var player;
var inGrass = false;
var encounter = false;
var transitionActive = false;
var bars = [];
var barsInitialized = false;
var resetGameTriggered = false;
var gameState = "overworld";
var enemyHP = 20;
var playerHP = 20;
var overworldSavedX = 0;
var overworldSavedY = 0;
var playerGuard = false;
var enemyGuard = false;
var playerPoison = 0;
var enemyPoison = 0;
var battleMessage = "A wild monster approached!";
var attackMenuOpen = false;

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
window.addEventListener("mousedown", function (e) {
    if (gameState !== "battle") return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // === RIGHT CLICK closes attack menu ===
    if (e.button === 2) {
        attackMenuOpen = false;
        battleMessage = "Choose an action:";
        return;
    }

    // === ATTACK MENU OPEN ===
    if (attackMenuOpen) {
        // Attack buttons placed EXACTLY where Fight/Item/Party/Run text was
        const attackButtons = [
            { name: "strike", x1: canvas.width/2,       x2: canvas.width/2 + 200, y1: canvas.height - 130, y2: canvas.height - 90 },
            { name: "guard",  x1: canvas.width/2,       x2: canvas.width/2 + 200, y1: canvas.height - 70,  y2: canvas.height - 30 },
            { name: "heal",   x1: canvas.width*0.75,    x2: canvas.width*0.75 + 200, y1: canvas.height - 130, y2: canvas.height - 90 },
            { name: "poison", x1: canvas.width*0.75,    x2: canvas.width*0.75 + 200, y1: canvas.height - 70,  y2: canvas.height - 30 }
        ];

        for (let atk of attackButtons) {
            if (mouseX > atk.x1 && mouseX < atk.x2 && mouseY > atk.y1 && mouseY < atk.y2) {
                attackMenuOpen = false;
                playerAttack(atk.name);
                return;
            }
        }

        return; // ignore other clicks while attack menu is open
    }

    // === MAIN MENU ===
    const fightX1 = canvas.width/2;
    const fightX2 = canvas.width*0.75;
    const topRowY1 = canvas.height - 150;
    const fightY2 = canvas.height - 70;

    if (mouseY > topRowY1) {

        // FIGHT
        if (mouseX > fightX1 && mouseX < fightX2 && mouseY < fightY2) {
            attackMenuOpen = true;
            battleMessage = "Choose an attack:";
            return;
        }

        // ITEM
        if (mouseX > fightX1 && mouseX < fightX2 && mouseY >= fightY2) {
            battleMessage = "Items not implemented";
            return;
        }

        // PARTY
        if (mouseX >= fightX2 && mouseY < fightY2) {
            battleMessage = "Party not implemented";
            return;
        }

        // RUN
        if (mouseX >= fightX2 && mouseY >= fightY2) {
            endBattleAndReturn();
            return;
        }
    }
});



// Prevent browser right-click menu
window.addEventListener("contextmenu", e => e.preventDefault());


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

function playerAttack(type) {
    if (type === "strike") {
        var dmg = 5;
        if (enemyGuard) dmg = 2;
        enemyHP -= dmg;
        battleMessage = "You used Strike! It dealt " + dmg + " damage!";
        enemyGuard = false;
    }

    if (type === "guard") {
        playerGuard = true;
        battleMessage = "You brace yourself!";
    }

    if (type === "heal") {
        playerHP += 6;
        if (playerHP > 20) playerHP = 20;
        battleMessage = "You healed!";
    }

    if (type === "poison") {
        enemyPoison = 3;
        battleMessage = "You poisoned the monster!";
    }

    // After player acts, monster takes a turn
    setTimeout(monsterTurn, 600);
}

function monsterTurn() {
    // Apply poison to monster
    if (enemyPoison > 0) {
        enemyHP -= 2;
        enemyPoison--;
        battleMessage = "Poison hurts the monster!";
    }

    if (enemyHP <= 0) {
        endBattleAndReturn();
        return;
    }

    // Monster chooses random move
    var moves = ["strike", "guard", "heal", "poison"];
    var choice = moves[Math.floor(Math.random() * moves.length)];

    if (choice === "strike") {
        var dmg = 4;
        if (playerGuard) dmg = 1;
        playerHP -= dmg;
        battleMessage = "Monster used Strike! You took " + dmg + " damage!";
        playerGuard = false;
    }

    if (choice === "guard") {
        enemyGuard = true;
        battleMessage = "Monster is guarding!";
    }

    if (choice === "heal") {
        enemyHP += 4;
        if (enemyHP > 20) enemyHP = 20;
        battleMessage = "Monster healed!";
    }

    if (choice === "poison") {
        playerPoison = 3;
        battleMessage = "Monster poisoned you!";
    }

    // Apply poison to player
    if (playerPoison > 0) {
        playerHP -= 2;
        playerPoison--;
        battleMessage += " Poison hurts you!";
    }

    // Check defeat
    if (playerHP <= 0) {
        battleMessage = "You fainted!";
        setTimeout(endBattleAndReturn, 1000);
    }
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

	// 7. Cinematic Bar Transition Animation
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

    	// Save overworld position
    	overworldSavedX = player.x;
    	overworldSavedY = player.y;

    	// Reset enemy HP for new encounter
    	enemyHP = 20;

    	// Switch to battle
   		gameState = "battle";

    	// Reset bars for next time
    	bars = [];
    	barsInitialized = false;
    	transitionActive = false;
		}
	}

	function drawBattleScreen() {
    // Background
    	context.fillStyle = "#222";
    	context.fillRect(0, 0, canvas.width, canvas.height);

    // -------------------------
    // ENEMY HP (Top-left)
    // -------------------------
    	context.fillStyle = "white";
    	context.font = "24px Arial";
    	context.fillText("Monster HP", 50, 50);

    	context.fillStyle = "green";
    	context.fillRect(50, 60, enemyHP * 5, 20);

    	context.fillStyle = "white";
    	context.fillText("L5", 50, 100);

    // -------------------------
    // TEAM MEMBER BOX (Bottom-left)
    // -------------------------
    	context.fillStyle = "green";
    	context.fillRect(50, canvas.height - 350, 200, 200);

    // -------------------------
    // MONSTER BOX (Centered, in front)
    // -------------------------
    	context.fillStyle = "blue";
    	context.fillRect(canvas.width/2 + 200, 50, 200, 200);

    // -------------------------
    // TEAM HP (Bottom-right corner)
    // -------------------------
    	context.fillStyle = "white";
    	context.font = "24px Arial";
    	context.fillText("Your Team HP", canvas.width - 250, canvas.height - 350);

    	context.fillStyle = "green";
    	context.fillRect(canvas.width - 250, canvas.height - 330, playerHP * 5, 20);

		context.fillStyle = "white";
		context.fillText("L5", canvas.width - 250, canvas.height - 290);

    // -------------------------
    // TEXT BOX
    // -------------------------
		context.fillStyle = "white";
		context.fillRect(0, canvas.height - 150, canvas.width, 150);

		context.fillStyle = "black";
		context.font = "22px Arial";
		context.fillText(battleMessage, 30, canvas.height - 110);

	// If attack menu is open, draw attack options
	if (attackMenuOpen) {
		context.fillStyle = "black";
		context.font = "26px Arial";

		context.fillText("Strike", canvas.width/2 + 20, canvas.height - 110);
		context.fillText("Guard",  canvas.width/2 + 20, canvas.height - 50);
		context.fillText("Heal",   canvas.width * 0.75 + 20, canvas.height - 110);
		context.fillText("Poison", canvas.width * 0.75 + 20, canvas.height - 50);
    return;
	}

    // -------------------------
    // MENU OPTIONS
    // -------------------------
		context.font = "28px Arial";

		context.fillText("Fight", canvas.width/2 + 20, canvas.height - 110);
		context.fillText("Item",  canvas.width/2 + 20, canvas.height - 50);

		context.fillText("Party", canvas.width * 0.75 + 20, canvas.height - 110);
		context.fillText("Run",   canvas.width * 0.75 + 20, canvas.height - 50);
	}

	if (gameState === "battle") {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawBattleScreen();
    return;
	}
	
}
