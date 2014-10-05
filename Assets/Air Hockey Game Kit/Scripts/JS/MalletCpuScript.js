
// MALLET CPU SCRIPT JS 20140803_1200 //

#pragma strict

// This is the mallet number (1 or 2) 
var malletNumber : int = 1;

// in "myRb" and "myTr" we will assign this gameObject rigidbody and transform components for optimisation.
private var myRb : Rigidbody;
private var myTr : Transform;

// Simple boolean to check if mallet is allowed to move
var canMove : boolean = true;

var speed : float = 4.0;

// The delay between actions
var actionDelay : int = 15;

// Actual count of the action delay
private var actionDelayCount : int = 0;

var puck : GameObject;

// In "puckRb" and "puckTr" we will assign the puck object rigidbody and transform components for optimisation.
private var puckRb : Rigidbody;
private var puckTr : Transform;

// PuckTarget is the reference object for puck position - CPU will follow it instead of following directly the puck
var puckTarget : Transform;

// Determine if the puck is on this mallet side
private var puckIsInZone : boolean;

// "actionState" determine the current behavior : "defense" or "attack"
private var actionState : String = "";

// Default spawn and defense positions of the mallet
private var spawnPosition : Vector3; 
private var defensePosition : Vector3;

// Used for displacement in "PerformAction()" function
private var direction : Vector3;
private var distance : float;

// value applied to attack movement
var attackStepBack : float = 0.02;

// The Force Mode used to move the rigidbody ("myRb") in "FixedUpdate()" function
// You should use a force mode that use rigidbody's mass ("Impulse" or "Force")
var forceModeType : ForceMode = ForceMode.Impulse;

// The mallet's side zone - It's also the parent of the gameObject
var zone : GameObject;

// is the game paused ?
var gamePause : boolean = false;

// Time delay before service when spawning
private var serviceDelayCount : float = 0;
private var serviceDelayCountMax : float = 2;

function OnDisable ()
{
		
	canMove = false;
	actionDelayCount = 0;
	actionState = "";
		
}

function Start ()
{
	
	// We cache components, this is usefull for performance optimisation !
	myTr = transform; // We will now use "myTr" instead of "transform"
	myRb = rigidbody; // and "myRb" instead of "rigidbody"
	
	// The rigidbody controlled by the CPU must be non-kinematic;
	myRb.isKinematic = false;
	
	// Object is not allowed to move yet
	canMove = false;
	
	// Reference to puck components
	puckTr = puck.transform;
	puckRb = puck.rigidbody;
	
	// Determine spawn and defense positions of our mallet
	spawnPosition =		Vector3(0, 0, - 0.25);
	defensePosition =	Vector3(0, 0, - 0.4);
	
}

// "OnPauseGame()" and "OnResumeGame()" are called by "MainScript" when hitting the pause key or button

function OnPauseGame ()
{

	myRb.Sleep();
	gamePause = true;
	
}

function OnResumeGame ()
{

	myRb.WakeUp();
	gamePause = false;
	
}

function Update ()
{	

	// If the mallet is not allowed to move, stop the function
    if (canMove == false || gamePause == true) return;
	
	 // If the puck is inactive, stop the function
    if (puck.active == false) return;
    
    // Update "puckTarget"'s local position
    puckTarget.localPosition = zone.transform.InverseTransformPoint(puckTr.position);
																																																						
	if (myTr.localPosition.x< -0.47) myTr.localPosition.x= -0.47;		// set minimum X local position
	else
	if (myTr.localPosition.x> 0.47) myTr.localPosition.x= 0.47;		// set maximum X local position
	
	if (myTr.localPosition.z< -0.47) myTr.localPosition.z= -0.47;		// set minimum Z local position
	else
	if (myTr.localPosition.z> 0.47) myTr.localPosition.z= 0.47;		// set maximum Z local position
		     
    // Check if puck is in the mallet's side of the playing surface
	if ( (puckTr.localPosition.z <= 0 && malletNumber == 1) || (puckTr.localPosition.z >= 0 && malletNumber == 2) )
	{	
		puckIsInZone=true;
		puckTarget.renderer.enabled = true; // "puckTarget"'s display is for debbuging purpose
	}
	
	// If not, set the action state to defense
	else
	{
		puckIsInZone=false;
		puckTarget.renderer.enabled = false;
	}																																					
    
    // We check if it's time to update IA State
    // If not, increment "actionDelayCount"
    if (actionDelayCount < actionDelay) actionDelayCount=actionDelayCount+1;
    
    // Else if we reach actionDelay value, perform the action
    else
    {
    	// call 'IA' function
	    PerformAction();
	    // and reset delay count
	    actionDelayCount = 0;
	}
	
}

// A very basic 'IA' script
function PerformAction ()
{

	// Puck is in mallet's zone, choose what to do
	if (puckIsInZone==true)
	{
		// The puck is in zone. Go for it (we could elaborate here more complex behaviors to determine if the cpu will attack or defense)
		actionState="attack";
	}
	
	else actionState="defense";

}

function FixedUpdate ()
{	

	// If the mallet is not allowed to move we stop the function
    if (canMove == false || gamePause == true) return;
    
    // else, check "actionState" value
    
    if (actionState == "defense")
    {
    	// Calculate the direction and distance to the defense position
    	
    	// Depending on the puck distance and velocity, just go to the defense position, or also target puck's "X" local position
    	
    	if (puckTarget.localPosition.z > 1.3 || puckTr.rigidbody.velocity.magnitude < 2)
    	direction = defensePosition - myTr.localPosition;
    	
    	else // also target puck's "X" local position
    	
    	direction = Vector3 (puckTarget.localPosition.x-defensePosition.x, myTr.localPosition.y, defensePosition.z) - myTr.localPosition;
		
		distance = direction.sqrMagnitude;

		//Debug.Log (""+gameObject.name+" distance : "+distance, gameObject);
		
		// Move the object to the defense position
		if (distance > 0.002) myRb.AddRelativeForce(direction.normalized * speed * 0.5, forceModeType); // forceModeType is 'Impulse' by default, it should not be set to a type that ignores rigidbody's mass
    	
    	else
    	
    	// If defense position is close enough, stop the movement
    	if (myRb.isKinematic == false) myRb.velocity = Vector3.zero;
    }
    
    else if (actionState == "attack")
    {	
    	// Calculate the direction from puck target object
    	// Set the value "attackStepBack" to 0.1 to get a nearly unbeatable AI
    	direction = puckTarget.localPosition - Vector3(myTr.localPosition.x,myTr.localPosition.y,myTr.localPosition.z+attackStepBack);
		
		// Move the object toward the puck
		myRb.AddRelativeForce(direction.normalized * speed, forceModeType);
    }

}

// Set the object at default position
function Place ()
{	
		
	while( gamePause == true )
    {
    	yield;
    }
	
	serviceDelayCount = 0;
				
	// Disable move, stop velocity
	canMove = false;
	myRb.isKinematic = true;
	
		
	// Align rotation with the parent axes, just in case anything was rotated (this should never happen)  
	myTr.localRotation = Quaternion.identity;
	
	// Place the mallet at default (spawn) position
	myTr.localPosition = spawnPosition;
	
	// Reset action delay count
	actionDelayCount = 0;
	
	// Reset action state
	actionState = "";
	
	yield;	
	
	// This is similar to WaitForSeconds but it is mandatory to work with pause	
	while (serviceDelayCount < serviceDelayCountMax)
	{
		if (gamePause == false) serviceDelayCount = serviceDelayCount + Time.deltaTime;
		yield;
	}

	serviceDelayCount = 0;
	
	myRb.isKinematic = false;
	canMove = true;
	
}

function OnCollisionEnter(collisionInfo : Collision)
{

	// Check the collision object's tag to detect if we hit the puck
    if (collisionInfo.gameObject.tag == "Puck") audio.Play();
    
}

function OnCollisionExit(collisionInfo : Collision)
{

	// Check the collision object's tag to detect if we hit the puck
    if (collisionInfo.gameObject.tag == "Puck")
    {
    	// We have just hit the puck, return to defense state
    	actionState="defense";
    	
    	// And reset delay count
	    actionDelayCount = 0;
    }
    
}
