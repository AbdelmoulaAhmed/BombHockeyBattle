
// MAIN SCRIPT JS 20140803_1315 //

#pragma strict

// "MainScript" controls the main functions of the game.
// It receives and manages the different game and UI events.

// This asset use a single scene for the various game stats (menus, game session, gameover...),
// this avoids loading times and optimise the project, for example if you target low-end mobile devices.

// The camera to use
var cam	: Camera;

// Game's current state
var gameState : String = "menu";

// Specify the game mode to the mallet ("1P" or "2P")
var gameMode : String = "1P";

// Game options :
var scoreToWin : int;
var difficulty : int;

// Scores for each player in a game session
var scoreP1 : int;
var scoreP2 : int;

// Level Up System values
var levelling : int[]; // Populate in editor with experience values to reach
var level : int = 1;
var experience : int = 0;

// delete all player preferences at start ? (for debugging purposes - should be set to false before compilation)
var debugDeleteAllPlayerPrefs : boolean;

// References to players (mallets) and their control scripts
// player 1 = mallet 1, player 2 = mallet 2
// Each 'player' can be a user or a CPU
var player1 				: GameObject; // mallet 1
private var p1CpuScript 	: MalletCpuScript;
private var p1PlayerScript 	: MalletPlayerScript;
var player2 				: GameObject; // mallet 2
private var p2CpuScript 	: MalletCpuScript;
private var p2PlayerScript 	: MalletPlayerScript;

var puck : GameObject;

private var puckScript : PuckScript;

// UI elements references
private var ui 				: GameObject;
private var uiStartScreen	: GameObject;
private var uiScore			: GameObject;
private var uiInGame		: GameObject;
private var uiPause			: GameObject;
private var uiGameOver		: GameObject;
var uiGameOverInfos			: GameObject[];
private var uiScoreScript : UiScoreScript;

// Used to store camera view value when switching view
private var cameraViewPrevious : int;

// Is the camera actually doing a transition ?
private var camTransition : boolean = false;

// Does the camera transition use lerp ?
private var camLerp : boolean = false;

// Camera transition values - End positions and euler angles for camera transition lerp
var camPosEnd : Vector3;
var camEulerAnglesEnd : Vector3;

// Used for UI interaction on touch screen device
var mousePosRay : Ray;
var hit : RaycastHit;
// LayerMask is used in the rayCast, to raycast for layer 14, "UI Layer". raycast is used to determine buttons selection on touch screen devices
var uiLayerMask : LayerMask = 1 << 14;

// "gameplayPreset" stores the gameplay type performed
// There are three example presets : "arcade", "balanced", or "simulation"
// See the function "ChangeGameplayPreset()" for more informations
private var gameplayPreset : String = "balanced"; // "arcade", "balanced", or "simulation"

// Physic materials are used when switching gameplay presets
var puckPhysicMat : PhysicMaterial[];
var malletPhysicMat : PhysicMaterial[];


// GUI vars (OnGUI)
// Show debug GUI ? (display debug option in Unity native GUI)
var showDebugGUI : boolean = true;
// Reference to mallet player Scripts "smoothedMoves" value
private var toggleUserSmoothedMove : boolean = true;
// Reference to mallet player Scripts "targetSpeed" value
private var userTargetSpeedValue : int;
private var userTargetSpeedValueText : String;
// Used to display the debug options
private var debugOptionWindowRect : Rect = Rect (1, 1, 200, 150);

// Game pause variables
// Is the game paused ?
var gamePause : boolean = false;
// Is the game allowed to pause ?
private var canPause : boolean = true;

function Awake ()
{

    // Set a unique framerate over different devices
    Application.targetFrameRate = 60;
    
}

function Start ()
{
	
	// The only PhysicsManager property that is modified, to get accuracy for real scale air hockey board - (Bounce Threshold default value is 2)
	Physics.bounceThreshold = 0.2;
	
	// Uncomment this line if you need a reminder
	//Debug.Log("Physics bounceThreshold set to 0.2", gameObject);

	// Access the CPU and Player scripts for each mallet
	
	// Get components "MalletCpuScript" from each player and assign them to variables "p1CpuScript" and "p2CpuScript"
	p1CpuScript = player1.GetComponent("MalletCpuScript") as MalletCpuScript;
	p2CpuScript = player2.GetComponent("MalletCpuScript") as MalletCpuScript;
	// Get components "MalletPlayerScript" from each player and assign them to variables "p1PlayerScript" and "p2PlayerScript"
	p1PlayerScript = player1.GetComponent("MalletPlayerScript") as MalletPlayerScript;
	p2PlayerScript = player2.GetComponent("MalletPlayerScript") as MalletPlayerScript;
	
	// Now get the puck's script
	puckScript = puck.GetComponent("PuckScript") as PuckScript;
	
	// Find User Interface components wich are located inside the camera, and assign them to variables
	ui				= GameObject.Find("UI");
	uiStartScreen	= GameObject.Find("UI_StartScreen");
	uiScore			= GameObject.Find("UI_Score");
	uiInGame		= GameObject.Find("UI_InGame");
	uiPause			= GameObject.Find("UI_Pause");
	uiGameOver		= GameObject.Find("UI_GameOver");
	
	// Get component "UiScoreScript" from "UI_Score" gameObject - "UiScoreScript" displays the score during game sessions 
	uiScoreScript = uiScore.GetComponent("UiScoreScript") as UiScoreScript;
	
	// Check screen size and reposition the UI's Z local position so we have a coherent UI size
	var pixelSize : float = Screen.width * Screen.height;
	if (pixelSize <= 153600) ui.transform.localPosition.z = 0.2; // <= 480*320
	else if (pixelSize <= 384000) ui.transform.localPosition.z = 0.23; // <= 800*480
	else if (pixelSize <= 614400) ui.transform.localPosition.z = 0.27; // <= 1024*600
	else ui.transform.localPosition.z = 0.35; // > 1024*600
	
	// Setup "userTargetSpeedValue" value for the debug "OnGUI()" function
	userTargetSpeedValue = p1PlayerScript.targetSpeed;
	
	gameplayPreset  = "balanced"; // "arcade", "balanced", or "simulation"
	
	// Set the game play to the preset notified in the value "gameplayPreset"
	SetGameplayPreset ();
	
		
	// delete all player preferences ? (for debugging purposes - should be set to false before compilation)
	if (debugDeleteAllPlayerPrefs == true) PlayerPrefs.DeleteAll();
	
	// Load player preferences for Level Up System
	if (PlayerPrefs.HasKey ("Player experience"))	experience	= PlayerPrefs.GetInt("Player experience");
	if (PlayerPrefs.HasKey ("Player level"))		level		= PlayerPrefs.GetInt("Player level");
	
	// Set "camPosEnd" and "camEulerAnglesEnd" to default values
	camPosEnd = cam.transform.localPosition;
	cam.transform.localRotation = cam.transform.parent.rotation;
	camEulerAnglesEnd = cam.transform.localEulerAngles;
	
	// Launch menu state
	InitMenu ();
	
}

// "GamePauseEnable()" and "GamePauseResume()" are called by "Update()" when hitting pause key and by "UiEventButton()" (called itself by the pause button's script)

function GamePauseEnable ()
{

	gamePause = true;
	
	yield;
	
	// Activate pause UI elements
	uiPause.SetActiveRecursively (true);
	
	var objects : GameObject[] = FindObjectsOfType (typeof(GameObject));
	
		for (var go : GameObject in objects)
		{
			go.SendMessage ("OnPauseGame", SendMessageOptions.DontRequireReceiver);
		}
	
}

function GamePauseResume ()
{

	gamePause = false;
	
	yield;
	
	//UnPause Objects
	var objects : GameObject[] = FindObjectsOfType (typeof(GameObject));
	for (var go : GameObject in objects)
	{
		go.SendMessage ("OnResumeGame", SendMessageOptions.DontRequireReceiver);
	}	

	// Deactivate pause UI elements
	uiPause.SetActiveRecursively (false);

}

function Update ()
{

	// Exit application on key input if we are in menu
   	if (Input.GetKeyDown ("escape") && gameState == "menu") Application.Quit();
	
	else
	
	// Game pause on key input
	if ( canPause == true && gameState == "game" && ( Input.GetKeyDown("p") || Input.GetKeyDown("escape") ) )
	{
		if (gamePause == false) GamePauseEnable();
		else GamePauseResume();
    }

	
	// If user is using a touch screen device, then detect UI buttons with a raycast
    if (gameState == "menu")
    {
		
		if (Input.touchCount == 1)
        {
        	// Create a ray going from camera through a screen point
	    	mousePosRay = Camera.main.ScreenPointToRay(Input.mousePosition);
		
			// Draw a mousePosRay reference in the scene view for debugging purpose
	    	var forward : Vector3 = mousePosRay.direction * 10;
	   		Debug.DrawRay (mousePosRay.origin, forward, Color.blue);	 
	    	
	   		// Check if the ray "mousePosRay" intersects "playingSurface" collider, located in layer 8 "TablePlayingSurface Layer" (or any other collider in this layer !)
	    	if (Physics.Raycast (mousePosRay, hit, 10, uiLayerMask))
	    	{
				if (Input.touches[0].phase == TouchPhase.Ended) hit.transform.SendMessage ("OnMouseUp");
			}
        }
    }
    
   if (cam.transform.localPosition == camPosEnd) camTransition = false;
	
	if (camTransition == true)
	{
		if (camLerp == true)
		{
			cam.transform.localPosition = Vector3.Lerp(cam.transform.localPosition, camPosEnd, 3 * Time.deltaTime);
			cam.transform.localEulerAngles = Vector3.Lerp(cam.transform.localEulerAngles, camEulerAnglesEnd, 5 * Time.deltaTime);
		}
		
		else // Else if no camera lerp
		{
			cam.transform.localPosition = camPosEnd;
			cam.transform.localEulerAngles = camEulerAnglesEnd;
		}
	}
	
}

// Change camera position/rotation
function SetCameraView (cameraView : int, lerp : boolean) // "cameraView" : "0" = menu, "1" = 1P camera, "2" = 2P camera
{
	
	if (cameraView == 0) // Set menu view
	{
		// Set the new (local) position
		camPosEnd = cam.transform.localPosition = Vector3 (0.7, 0.6, -0.8);
		// Align the camera rotation with the parent
		cam.transform.localRotation = cam.transform.parent.rotation;
		// Rotate the camera locally to the desired angle
		camEulerAnglesEnd = cam.transform.localEulerAngles = Vector3 (45, 305, 0);
		//cam.fieldOfView = 60; // Set FOV		
	}
	
	else
	
	if (cameraView == 1) // Set 1 player mode perspective view
	{
		// Set the new (local) position
		camPosEnd = Vector3 (0, 0.33, -1.6);
		// Align the camera rotation with the parent
		cam.transform.localRotation = cam.transform.parent.rotation;
		// Rotate the camera locally to the desired angle
		camEulerAnglesEnd = Vector3 (10, 0, 0);
		//cam.fieldOfView = 60; // Set FOV
	}

	else
	
	if (cameraView == 2) // Set 1 player mode perspective view
	{
		// Set the new (local) position
		camPosEnd = Vector3 (0, 0.5, -1.5);
		// Align the camera rotation with the parent
		cam.transform.localRotation = cam.transform.parent.rotation;
		// Rotate the camera locally to the desired angle
		camEulerAnglesEnd = Vector3 (30, 0, 0);
		//cam.fieldOfView = 60; // Set FOV
	}
	
		else
	
	if (cameraView == 3) // Set 1 player mode perspective view
	{
		// Set the new (local) position
		camPosEnd = Vector3 (0, 1.1, -1.5);
		// Align the camera rotation with the parent
		cam.transform.localRotation = cam.transform.parent.rotation;
		// Rotate the camera locally to the desired angle
		camEulerAnglesEnd = Vector3 (45, 0, 0);
		//cam.fieldOfView = 60; // Set FOV
	}	
	
	else
	
	if (cameraView == 4) // Set 2 players mode top-down view
	{
		// Set the new (local) position
		camPosEnd = cam.transform.localPosition = Vector3 (0, 1.4, 0);
		// Align the camera rotation with the parent
		cam.transform.localRotation = cam.transform.parent.rotation;
		// Rotate the camera locally to the desired angle
		camEulerAnglesEnd = cam.transform.localEulerAngles = Vector3 (90, -90, 0);
		//cam.fieldOfView = 60; // Set FOV
	}

	cameraViewPrevious = cameraView;
	
	camTransition = true; camLerp = lerp;
	
}

// Called by UI buttons
function UiEventButton (buttonNumber : int)
{

	// Uncomment this line if you need to test the UI
	// Debug.Log("UiEventButton called by button number "+buttonNumber, gameObject);
	
	// If button is '1 Player' start button
	if (buttonNumber == 1)
	{
		gameMode = "1P";
		InitGame (gameMode);
	}
	
	else
	
	// If button is '2 Players' start button
	if (buttonNumber == 2)
	{
		gameMode = "2P";
		InitGame (gameMode);
	}
	
	else
	
	// If button is 'CAMERA' in-game button
	if (buttonNumber == 5)
	{
		if (cameraViewPrevious == 1)
		{
			// Save the new preset in Player Preferences
			PlayerPrefs.SetInt("Game cameraView", 2);
			SetCameraView (2, true); // Call camera view 2 with lerp transition
		}
		
		else
		if (cameraViewPrevious == 2)
		{
			// Save the new preset in Player Preferences
			PlayerPrefs.SetInt("Game cameraView", 3);
			SetCameraView (3, true); // Call camera view 3 with lerp transition
		}
		
		else
		if (cameraViewPrevious == 3)
		{
			// Save the new preset in Player Preferences - Only if we are not in "2P" gameMode
			if (gameMode != "2P") PlayerPrefs.SetInt("Game cameraView", 4);
			SetCameraView (4, false); // Call camera view 4 without lerp transition
		}
		
		else
		if (cameraViewPrevious == 4)
		{
			// Save the new preset in Player Preferences
			PlayerPrefs.SetInt("Game cameraView", 1);
			SetCameraView (1, false); // Call camera view 1 without lerp transition
		}
		
	}
	
	else
	
	// If button is 'PAUSE' in-game button
	if (buttonNumber == 6)
	{
		if (gamePause == false) GamePauseEnable();
		else GamePauseResume();
	}
	
	else
	
	// If button is 'RESUME' pause button
	if (buttonNumber == 7)
	{
		GamePauseResume();
	}
	
	else
	
	// If button is 'MENU' pause button
	if (buttonNumber == 8)
	{
		InitMenu();
	}
	
}




// Called by UI buttons
function UiEventOptionButton (buttonNumber : int, optionValue : int)
{

	// Uncomment this line if you need to test the UI
	//Debug.Log("UiEventOptionButton called by button number "+buttonNumber+", received value "+optionValue, gameObject);
	
	// If button is "Score to win" button
	if (buttonNumber == 3) scoreToWin = optionValue;
	
	else
	
	// If button is "Difficulty" button
	if (buttonNumber == 4)
	{
		difficulty = optionValue;
		
		yield;
		
		p1CpuScript.speed = p2CpuScript.speed = 1.25 + difficulty; // Quick example of difficulty tweaking
	}
}

function InitMenu ()
{

	// Change the game's state
	gameState = "menu";
	
	// Turn off the volume
	AudioListener.volume = 0;
	
	// Disable both mallets PlayerScript, so the user can't control them
	p1PlayerScript.enabled = false;
	p2PlayerScript.enabled = false;
	
	// Enable CPU's script for both mallets (= rolling demo !)
	p1CpuScript.enabled = true;
	p2CpuScript.enabled = true;
	
	// Stop the possibly active coroutines in cpu scripts
	p1CpuScript.StopAllCoroutines();
	p2CpuScript.StopAllCoroutines();
	
	puck.active = true;
	
	// Enable puck script
	puckScript.enabled = true;
	
	// Reset scores and score UI
	scoreP1 = scoreP2 = 0;
	uiScoreScript.ResetUIScore();
	
	// Deactivate the possibly showing gameOver UI
	for (uiGameOverInfo in uiGameOverInfos) uiGameOverInfo.SetActiveRecursively (false);
	
	// Deactivate in game UI elements
	uiInGame.SetActiveRecursively (false);
	
	
	// Disallow the game to pause
	canPause = false;
	// Deactivate pause UI elements
	uiPause.SetActiveRecursively (false);
	
	yield;
	
	// Resume pause for all scene entities
	GamePauseResume ();
	
	yield;
	
	// Set camera menu placement
	SetCameraView (0, false); // Menu view
	
	p1CpuScript.Place();
	p2CpuScript.Place();
	puckScript.Place(parseInt(Random.Range(1,3))); // Place puck at random side
	
	// Activate Start Screen's UI elements
	uiStartScreen.SetActiveRecursively (true);
	// Deactivate score UI
	uiScore.SetActiveRecursively (false);
	
}

function InitGame (gameMode : String) //game mode is "1P" for 1 player game or "2P" for 2 players touch screen game.
{

	// Change the game's state
	gameState = "game";
	
	// Allow the game to pause
	canPause = true;
	
	// Deactivate Start Screen's UI elements
	uiStartScreen.SetActiveRecursively (false);
	// Activate score UI
	uiScore.SetActiveRecursively (true);
	
	// Stop and disable Cpu scripts (previously used for the rolling demo in the menu)
	p1CpuScript.StopAllCoroutines();
	p1CpuScript.enabled = false;
	p2CpuScript.StopAllCoroutines();
	p2CpuScript.enabled = false;	
	
	if (gameMode == "1P")
	{
		
		// Activate in game UI elements - Only in 1 player game mode (pause is still accessible by key press !)
		uiInGame.SetActiveRecursively (true);
		
		// Place the camera to a position to be translated from
		cam.transform.localPosition = Vector3 (0, 1.5, -3);
		cam.transform.localRotation = cam.transform.parent.rotation;
		camEulerAnglesEnd = Vector3 (10, 0, 0);
		
		// If cameraView has been already stored in Player Preference, set camera accordingly
		if (PlayerPrefs.HasKey ("Game cameraView")) SetCameraView (PlayerPrefs.GetInt("Game cameraView"), true); // Set the camera position and rotation
		else SetCameraView (2, true); // Set the camera position and rotation
		
		p1PlayerScript.enabled = true;
		p2CpuScript.enabled = true;
		puckScript.enabled = true;
		
		// Notify player script of the actual game mode
		p1PlayerScript.gameMode = gameMode;

		yield;
		
		p1PlayerScript.Place();
		p2CpuScript.Place();
	}
	
	else
	
	if (gameMode == "2P")
	{
		SetCameraView (4, false); // Set top-down view
		
		p1PlayerScript.enabled = true;
		p2PlayerScript.enabled = true;
		puckScript.enabled = true;
		
		// Notify player scripts of the actual game mode
		p1PlayerScript.gameMode = p2PlayerScript.gameMode = gameMode;
		
		yield;
		
		p1PlayerScript.Place();
		p2PlayerScript.Place();	
	}
	
	puck.active = true;
	puckScript.Place(0); // place the puck at the center of the playing surface
	AudioListener.volume = 1; // Turn on the volume
	
}


// "SetGameplayPreset()" changes the type of gameplay, from arcade to realistic
// This function is called by GUI button (located in "OnGUI" function)
function SetGameplayPreset ()
{

	if (gameplayPreset == "arcade")
	{
		// Setup arcade preset
		puckScript.maxVelocity = 3;
		puckScript.SetMaxVelocity (puckScript.maxVelocity);
		puck.rigidbody.mass = 0.01;
		puck.rigidbody.drag = 0.0;
		puck.rigidbody.angularDrag = 0.5;
		
		// Change the physic materials of the mallets and puck
		puck.collider.material = puckPhysicMat [0];
		player1.collider.material = player2.collider.material = malletPhysicMat [0];
		
		// Enable player scripts "smoothedMoves" and set "targetSpeed" value
		// ("toggleUserSmoothedMove" and "userTargetSpeedValue" are their references in debug gui window)
		p1PlayerScript.smoothedMoves = p2PlayerScript.smoothedMoves = toggleUserSmoothedMove = true;
		p1PlayerScript.targetSpeed =  p2PlayerScript.targetSpeed = userTargetSpeedValue = 15;

		yield;
	}
	
	else
	
	if (gameplayPreset == "balanced")
	{
		// Setup balanced preset
		puckScript.maxVelocity = 4.15; 
		puckScript.SetMaxVelocity (puckScript.maxVelocity);
		puck.rigidbody.mass = 0.03;
		puck.rigidbody.drag = 0.1;
		puck.rigidbody.angularDrag = 0.5;
		
		// Change the physic materials of the mallets and puck
		puck.collider.material = puckPhysicMat [1];
		player1.collider.material = player2.collider.material = malletPhysicMat [1];
				
		// Enable player scripts "smoothedMoves" and set "targetSpeed" value
		p1PlayerScript.smoothedMoves = p2PlayerScript.smoothedMoves = toggleUserSmoothedMove = true;
		p1PlayerScript.targetSpeed =  p2PlayerScript.targetSpeed = userTargetSpeedValue = 25;
		
		yield;
	}
	
	else
	
	if (gameplayPreset == "simulation")
	{
		// Setup simulation preset
		puckScript.maxVelocity = 12;
		puckScript.SetMaxVelocity (puckScript.maxVelocity);
		puck.rigidbody.mass = 0.06;
		puck.rigidbody.drag = puck.rigidbody.angularDrag = 0.5;
		
		// Change the physic materials of the mallets and puck
		puck.collider.material = puckPhysicMat [2];
		player1.collider.material = player2.collider.material = malletPhysicMat [2];
				
		// Enable player scripts "smoothedMoves" and set "targetSpeed" value
		p1PlayerScript.smoothedMoves = p2PlayerScript.smoothedMoves = toggleUserSmoothedMove = true;
		p1PlayerScript.targetSpeed =  p2PlayerScript.targetSpeed = userTargetSpeedValue = 35;
		
		yield;
	}
	
}

function UpdateScore (goalNumber : int)
{	

	while( gamePause == true )
    {
    	yield;
    }
	
	// If we are not in game
	if (gameState == "menu")
	{
		SetGameService (goalNumber);
	}
	
	else if (goalNumber == 1)
	{
		// Update player 2 score
		scoreP2++;
		
		// Update the score UI ("UI_Score")
		uiScoreScript.UpdateUIScore (2, scoreP2);
		
		// Did we reach the score to win ?
		if (scoreP2 == scoreToWin) GameOver (2);
		
		// Else launch the new service, player 1 has the service
		else SetGameService (1);	
	}
	
	else // If "goalNumber" = 2
	{
		// Update player 1 score
		scoreP1++;
		
		// Update the score UI ("UI_Score")
		uiScoreScript.UpdateUIScore (1, scoreP1);
		
		// Did we reach the score to win ?
		if (scoreP1 == scoreToWin)
		{
			// Update experience points (10 points for winning)
			experience = experience + 10;
			
			// Save "experience" value to player preferences
			PlayerPrefs.SetInt("Player experience", experience);
			
			print("experience = " + experience);
			
			// Then check for level up
			LevellingCheck();
			
			GameOver (1);
		}
		
		// Else launch the new service, player 2 has the service
		else 
		{	
			// Update experience points (5 points for scoring)
			experience = experience + 5;
			
			// Save "experience" value to player preferences
			PlayerPrefs.SetInt("Player experience", experience);
			
			print("experience = " + experience);
									
			// Then check for level up
			LevellingCheck();
			
			SetGameService (2);
		}
	}
		
}

// Place the mallets and puck
function SetGameService (serviceSide : int)
{

	while( gamePause == true )
    {
    	yield;
    }
	
	if (gameState == "menu")
	{
		p1CpuScript.Place();
		p2CpuScript.Place();
	}
	
	else if (gameMode == "1P")
	{
		p1PlayerScript.Place();
		p2CpuScript.Place();
	}
	
	else if (gameMode == "2P")
	{
		p1PlayerScript.Place();
		p2PlayerScript.Place();
	}

	// Place the puck according to the service side
	puckScript.Place(serviceSide);
	
}	

function GameOver (winner : int)
{

	while( gamePause == true )
    {
    	yield;
    }
	
	gameState = "gameOver";
	Debug.Log ("Player "+winner+" WIN ! (game mode = "+gameMode+")");

	puck.active = false;
	
	// If game mode = 1 player, and player win
	if (gameMode == "1P" && winner == 1)
	{	
		// Display UI message : "YOU WIN !"
		uiGameOverInfos[0].SetActiveRecursively (true);
		p1PlayerScript.canMove = false;
		p2CpuScript.canMove = false;
	}
	
	else
	
	// If game mode = 1 player, and player loose
	if (gameMode == "1P" &&  winner == 2)
	{	
		// Display UI message : "YOU LOOSE !"
		uiGameOverInfos[1].SetActiveRecursively (true);
		p1PlayerScript.canMove = false;
		p2CpuScript.canMove = false;
	}
		
	else
	
	// If game mode = 2 players, and player 1 win
	if (gameMode == "2P" &&  winner == 1)
	{	
		// Display UI message : "P1 WIN !"
		uiGameOverInfos[2].SetActiveRecursively (true);
		p1PlayerScript.canMove = false;
		p2PlayerScript.canMove = false;
	}
			
	else
	
	// If game mode = 2 players, and player 2 win
	if (gameMode == "2P" &&  winner == 2)
	{	
		// Display UI message : "P2 WIN !"
		uiGameOverInfos[3].SetActiveRecursively (true);
		p1PlayerScript.canMove = false;
		p2PlayerScript.canMove = false;
	}
	
	// Play the rotating message animation
	uiGameOver.animation.Play(); 
	
	yield WaitForSeconds (3);
	InitMenu();
	
}


// Check for level up
function LevellingCheck ()
{
	var levelUp : boolean = false;
	
	// loop through "levelling" array
	for (var i = 0; i < levelling.length; i++)
	{	
		// Do we reach a new level ?
		if (i+1 >= level && levelling[i] <= experience)
		{	
			levelUp = true;
			// increment "level" value
			level = level + 1;
		}		
	}
	
	// Save "level" value to player preferences
	PlayerPrefs.SetInt("Player level", level);
	
	if (levelUp == true) print ("Level up ! You reached level " + level);
	
}

// All the following code is optional and used to show the GUI ////////////////////////////////////////////

function OnGUI()
{

	if (showDebugGUI == true)
	// Display the debug options window
	debugOptionWindowRect = GUI.Window (0, debugOptionWindowRect, GuiDebugWindowFunction, "Debug Options");

}

// This function is called in "OnGUI()" to display the debug options
function GuiDebugWindowFunction()
{
	
	// Create the button for gameplay preset selection
    if (GUI.Button(Rect(40,30,120,50),"Gameplay : \n"+gameplayPreset))
    {	
    	// Switch the variable "gameplayPreset" when button is clicked
    	if (gameplayPreset == "simulation") {gameplayPreset = "arcade";}
    	else
    	if (gameplayPreset == "arcade") {gameplayPreset = "balanced";}
    	else
    	if (gameplayPreset == "balanced") {gameplayPreset = "simulation";}
    	
    	// Call the function that changes the preset
    	SetGameplayPreset();
    }  
    
	toggleUserSmoothedMove = GUI.Toggle (new Rect (22, 80, 200, 30), toggleUserSmoothedMove, "User smoothed moves");  
	p1PlayerScript.smoothedMoves = p2PlayerScript.smoothedMoves = toggleUserSmoothedMove;
    	
    	// if user smoothed moves is enabled, display a slider to control player scripts' "targetSpeed" value
		if (toggleUserSmoothedMove == true)
    	{	
    		// display "Target speed :" label
    		GUI.Label (new Rect (25, 100, 150, 30), "Target speed :");
    		
    		// display the horizontal slider
    		userTargetSpeedValue = GUI.HorizontalSlider (new Rect (15, 120, 150, 30), userTargetSpeedValue, 1, 100);
    		p1PlayerScript.targetSpeed = p2PlayerScript.targetSpeed = userTargetSpeedValue;
    		
    		// display "userTargetSpeedValue" in a text label next to the slider
    		userTargetSpeedValueText = ""+userTargetSpeedValue;
    		GUI.Label (new Rect (165, 115, 150, 30), ""+userTargetSpeedValue);
    		
    		// Expand the window height
    		debugOptionWindowRect = Rect (1, 1, 200, 150);
    		
    	}
    	
    	else
   		{
   			// Shorten the window height
    		debugOptionWindowRect = Rect (1, 1, 200, 110);
   		}

}