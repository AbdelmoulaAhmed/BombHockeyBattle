
// MALLET PLAYER SCRIPT JS 20140908_1137 //

#pragma strict

// This is the mallet number (1 or 2) 
var malletNumber : int = 1;

// Specify the game mode (from "MainScript") to the mallet ("1P" or "2P")
var gameMode : String = "1P";	

// Game's camera
var cam : Camera;

// Targets are the reference objects for mallets movement - Instead of moving directly the mallet
// "targetTr" is the Target's Transform
var targetTr : Transform;

// Smooth "targetTr" moves
var smoothedMoves : boolean = true;

// The speed of the target displacement - if smoothed moves are activated 
var targetSpeed : int = 20;

// Simple boolean to check if mallet is allowed to move
var canMove : boolean = true;

// Ray going from mouse position through a screen point
var mousePosRay : Ray;

// Mallet's start position on new service
private var spawnPosition : Vector3;

// Mallet's defense position
private var defensePosition : Vector3;

// In "myRb" and "myTr" we will assign the gameObject's rigidbody and transform components for optimisation.
private var myRb : Rigidbody;
private var myTr : Transform;

// Used to draw debug rays in the scene view
private var forward : Vector3;

// The raycast hit of the input raycast
private var hit : RaycastHit;

// the ray hit position relative to the zone's local position - this is used in "Update()" function to move mallet's target ("TargetTr")
private var hitPosRelativeToZoneSpace : Vector3; // = Vector3 (0, 0, 1);

// The rigidbody movement to compute relative to the zone - this is used in "FixedUpdate()" for rigidbody ("myRb")'s motion
private var constrainedTargetPosToWorldSpace : Vector3;

// The "targetTr" position relative to "zone"'s local position
// This value is computed then constrained to boundaries in "FixedUpdate()" before using it to move rigidbody
private var targetPosRelativeToZoneSpace : Vector3;

// LayerMask is used in the rayCast, to raycast for layer 8, "InputRaycast Layer". raycast is used to determine player movement.
var layerMask : LayerMask = 1 << 8;

// The mallet's side zone - It's also the parent of the gameObject
var zone : GameObject;

// This checks if a Log warning concerning multi-touch capacities was already shown
private var multiTouchWarningWasShown : boolean = false;

// is the game paused ?
var gamePause : boolean = false;

// Time delay before service when spawning
private var serviceDelay : float = 0;
private var serviceDelayMax : float = 2;


function Start ()
{		
																	
	// We cache components, this is usefull for performance optimisation !
	myTr = transform; // We will now use "myTr" instead of "transform"
	myRb = rigidbody; // and "myRb" instead of "rigidbody"

	// To be controlled by player the rigidbody needs to be set to kinematic;
	myRb.isKinematic = true;

	// Object is not allowed to move yet
	canMove = false;
	
	// Determine spawn and defense positions of our mallet
	spawnPosition =		Vector3(0, 0, - 0.25);
	defensePosition =	Vector3(0, 0, - 0.45);

}

// "OnPauseGame()" and "OnResumeGame()" are called by "MainScript" when hitting the pause key or button

function OnPauseGame ()
{

	gamePause = true;
	
}

function OnResumeGame ()
{

	gamePause = false;
	
}

function Update ()
{	

	// If the mallet is not allowed to move, stop the function
    if (canMove == false || gamePause == true) return;
	
	// Does the actual device support multiTouch ?
	if (Input.multiTouchEnabled == true && Application.platform != RuntimePlatform.WindowsEditor && Application.platform != RuntimePlatform.OSXEditor) // If true, use "GetTouch()" function // RuntimePlatform condition is here to prevent a regression bug happening somewhere in the 4.2 cycle ( http://issuetracker.unity3d.com/issues/input-dot-multitouchenabled-is-true-in-editor-for-standalon-slash-web-used-to-be-false )
	{
		for (var touch : Touch in Input.touches)
		{
			// Construct a ray from the current touch coordinates
			mousePosRay = Camera.main.ScreenPointToRay (touch.position);
			if (Physics.Raycast (mousePosRay, hit, 10, layerMask))
			{
				// Convert hit point position from world space to "zone"'s local space - so we can retrieve input positions relative to each zone
				// We do it using "Transform.InverseTransformPoint" (see http://docs.unity3d.com/Documentation/ScriptReference/Transform.InverseTransformPoint.html)
				hitPosRelativeToZoneSpace = zone.transform.InverseTransformPoint(hit.point);
			    	
				//Debug.Log(""+gameObject.name+" hitPosRelativeToZoneSpace : "+hitPosRelativeToZoneSpace, gameObject);		

				// Ray hit ! - we update "targetTr"'s position at the raycast hit position
				// In 2 players game mode, we take the actual raycast hit into account only if it is in the player side
				if (gameMode=="1P" || gameMode=="2P" && hitPosRelativeToZoneSpace.z < 0.5)
				{
					// If movement is smoothed ("smoothedMoves" value is true), use a lerp to smooth the positioning of "targetTr"
					if (smoothedMoves==true)
					{	
						// Move from "myTr" local position to "hitPosRelativeToZoneSpace" at the given speed ("targetSpeed")								
						targetTr.localPosition = Vector3.Lerp( myTr.localPosition, Vector3(hitPosRelativeToZoneSpace.x, targetTr.localPosition.y, hitPosRelativeToZoneSpace.z), targetSpeed * Time.fixedDeltaTime );
					}
						
					else // if "smoothedMoves" is false, use direct positioning
					{
						targetTr.localPosition = Vector3(hitPosRelativeToZoneSpace.x, targetTr.localPosition.y, hitPosRelativeToZoneSpace.z);																											
					}
				}
																																																																																																																																																	
				// Draw a mousePosRay reference in the scene view for debugging purpose
				// Player 1 debug ray is green, player 2 one is yellow
				forward = mousePosRay.direction * 10;
				if (malletNumber == 1)		{Debug.DrawRay (mousePosRay.origin, forward, Color.green);}	
				else if (malletNumber == 2) {Debug.DrawRay (mousePosRay.origin, forward, Color.yellow);}
			}
	    }
	}   
	
		   	   	   
	else // if "Input.multiTouchEnabled" is false, use input mouse Position
	{	
		// If game mode is "2P", show a warning in the editor console as the device is not compatible with this mode !
		if (gameMode=="2P" && multiTouchWarningWasShown == false)
		{
			Debug.LogWarning("Your device is not compatible with this game mode ! You need to run it on a multi-touch enabled device.", gameObject); multiTouchWarningWasShown = true;
		}   
			   	   
	    // Create a ray going from camera through a screen point
	    mousePosRay = cam.main.ScreenPointToRay(Input.mousePosition);
	    			
	   	// Check if the ray "mousePosRay" intersects "ColliderInputRaycast" collider, located in layer 8 "InputRaycast Layer" (or any other collider in this layer !)
	    if (Physics.Raycast (mousePosRay, hit, 10, layerMask))
	    {
			// Convert hit point position from world space to "zone"'s local space - so we can retrieve input positions relative to each zone
		   	// We do it using "Transform.InverseTransformPoint" (see http://docs.unity3d.com/Documentation/ScriptReference/Transform.InverseTransformPoint.html)
		   	hitPosRelativeToZoneSpace = zone.transform.InverseTransformPoint(hit.point);
		    	
		    //Debug.Log(""+gameObject.name+" hitPosRelativeToZoneSpace : "+hitPosRelativeToZoneSpace, gameObject);		
				
			// Ray hit ! - we update "targetTr"'s position at the raycast hit position
			// In 2 players game mode, we take the actual raycast hit into account only if it is in the player side
			if (gameMode=="1P" || gameMode=="2P" && hitPosRelativeToZoneSpace.z < 0.5)
			{
				// If movement is smoothed ("smoothedMoves" value is true), use a lerp to smooth the positioning of "targetTr"
				if (smoothedMoves==true)
				{	
					// Move from "myTr" local position to "hitPosRelativeToZoneSpace" at the given speed ("targetSpeed")								
					targetTr.localPosition = Vector3.Lerp( myTr.localPosition, Vector3(hitPosRelativeToZoneSpace.x, targetTr.localPosition.y, hitPosRelativeToZoneSpace.z), targetSpeed * Time.deltaTime );
				}
						
				else // if "smoothedMoves" is false, use direct positioning
				{
					targetTr.localPosition = Vector3(hitPosRelativeToZoneSpace.x, targetTr.localPosition.y, hitPosRelativeToZoneSpace.z);																											
				}
			}
																																																																																				
			// Draw a mousePosRay reference in the scene view for debugging purpose
			// Player 1 debug ray is green, player 2 one is yellow
	    	forward = mousePosRay.direction * 10;
	    	if (malletNumber == 1)		{Debug.DrawRay (mousePosRay.origin, forward, Color.green);}	
	    	else if (malletNumber == 2) {Debug.DrawRay (mousePosRay.origin, forward, Color.yellow);}
	    }
    }

}

function FixedUpdate ()
{
	
	// If the mallet is not allowed to move, stop the function
    if (canMove == false || gamePause == true) return;			
			
	// If we are in "2P" game mode and "targetTr" local position.z is out of zone, we stop the function, preventing is movement
	if  (gameMode=="2P" && targetTr.localPosition.z > 0.5) return;
	
	// Else we process the movement
	
	// Convert "targetTr.position" to "zone"'s local space ("InverseTransformPoint" transforms position from world space to local space)
	var targetPosRelativeToZoneSpace : Vector3 = zone.transform.InverseTransformPoint(targetTr.position);
	
	// Debug.Log(""+gameObject.name+" targetPosRelativeToZoneSpace : "+targetPosRelativeToZoneSpace, gameObject);
	
	// Limit the movement to boundaries	
	if (targetPosRelativeToZoneSpace.x < -0.47)	targetPosRelativeToZoneSpace.x = -0.47;	// compare/replace to bound limit X-
	else
	if (targetPosRelativeToZoneSpace.x > 0.47)	targetPosRelativeToZoneSpace.x = 0.47;	// compare/replace to bound limit X+
	
	if (targetPosRelativeToZoneSpace.z < -0.47)	targetPosRelativeToZoneSpace.z = -0.47;	// compare/replace to bound limit Z-
	else
	if (targetPosRelativeToZoneSpace.z > 0.47)	targetPosRelativeToZoneSpace.z = 0.47;	// compare/replace to bound limit Z+
	
	// Then convert the constrained local position "targetPosRelativeToZoneSpace" to World Space
	constrainedTargetPosToWorldSpace = zone.transform.TransformPoint(targetPosRelativeToZoneSpace);
	
	// Debug.Log(""+gameObject.name+" constrainedTargetPosToWorldSpace : "+constrainedTargetPosToWorldSpace, gameObject);
	
	// Process the rigidbody's motion - makes it follow "targetTr", but now constrained to bound limits
	myRb.MovePosition (constrainedTargetPosToWorldSpace);
	
}

// Set the object at default position
function Place ()
{
			
	while( gamePause == true )
    {
    	yield;
    }
	
	// Reset "serviceDelay" value
	serviceDelay = 0;		
							
	multiTouchWarningWasShown = false;
	
	// Prevent physic behaviors
	canMove = false;
	myRb.isKinematic = true;
	
		
	// Align rotation with the parent axes, just in case anything was rotated (this should never happen)  
	myTr.localRotation = Quaternion.identity;
	
	// place the mallet at is default position
	myTr.localPosition = targetTr.localPosition = spawnPosition;
	
	yield;
	
	while (serviceDelay < serviceDelayMax)
	{
		if (gamePause == false) serviceDelay = serviceDelay + Time.deltaTime;
		yield;
	}
	
	// Reset "serviceDelay" value
	serviceDelay = 0;
	
	canMove = true;
	
}

function OnCollisionEnter(collisionInfo : Collision)
{

	// Check the collision object's tag to detect if we hit the puck
    if (collisionInfo.gameObject.tag == "Puck") audio.Play();
    
}