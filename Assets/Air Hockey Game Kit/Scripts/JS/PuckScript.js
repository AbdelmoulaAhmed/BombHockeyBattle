
// PUCK SCRIPT JS 20140803_1200 //

#pragma strict

// the maximum physic velocity allowed for the puck
var maxVelocity : float = 10.0;

// Simple boolean to check if puck is allowed to move
var canMove : boolean = true;

// in "myRb" and "myTr" we will assign the gameObject rigidbody and transform components for optimisation.
private var myRb : Rigidbody;
private var myTr : Transform;

//private var clampedVelocity : Vector3;
private var sqrMaxVelocity : float;
private var curVelocity : Vector3;

// Save velocity properties to restore them on resume pause
private var pausedVelocity : Vector3;
private var pausedAngularVelocity : Vector3;

// is the game paused ?
var gamePause : boolean = false;

function Start ()
{

	// We assign transform and rigidbody to the variables bellow for optimisation.
	myTr = transform; // We will now use "myTr" instead of "transform"
	myRb = rigidbody; // and "myRb" instead of "rigidbody"
	
	// Call "SetMaxVelocity()" function whoes compute "sqrMaxVelocity" value based on "maxVelocity";
	SetMaxVelocity (maxVelocity);
	
}

// "OnPauseGame()" and "OnResumeGame()" are called by "MainScript" when hitting the pause key or button

function OnPauseGame ()
{

	pausedVelocity = myRb.velocity;
	pausedAngularVelocity = myRb.angularVelocity;
	gamePause = true;
	myRb.isKinematic = true;
	myTr.collider.enabled = false;
	
}

function OnResumeGame ()
{

	gamePause = false;
	myRb.isKinematic = false;
	myTr.collider.enabled = true;
	myRb.velocity = pausedVelocity;
	myRb.angularVelocity = pausedAngularVelocity;
	
}

// Called by "MainScript" -Should be called when puck's velocity has to be changed !
function SetMaxVelocity (maxVelocity : float)
{
	
	this.maxVelocity = maxVelocity;
	sqrMaxVelocity = maxVelocity * maxVelocity;
	
}

function Update ()
{
	
	// If the puck is not allowed to move, stop the function
	if (canMove == false || gamePause == true) return;
	/*	
	// Prevent the puck to go out of the playing surface																																																						
	if (myTr.localPosition.x < -0.6)	myTr.localPosition.x= -0.5;		// set minimum X position
	else
	if (myTr.localPosition.x > 0.6)	myTr.localPosition.x= 0.5;			// set maximum X position
	
	if (myTr.localPosition.z < -1.2)	myTr.localPosition.z= -1.1;		// set minimum Z position
	else
	if (myTr.localPosition.z > 1.2)	myTr.localPosition.z= 1.1;			// set maximum Z position
	*/	
}	

function FixedUpdate ()
{
	
	// If the puck is not allowed to move, stop the function
	if (canMove == false || gamePause == true) return;
	
	// Get current velocity
	curVelocity = myRb.velocity;
	
	// Check if rigidbody's velocity exceed max velocity and correct it
	if (curVelocity.sqrMagnitude > sqrMaxVelocity && myRb.isKinematic == false)
	{
		myRb.velocity = curVelocity.normalized * maxVelocity;
	}
							
}

// Place the puck in the notified zone - serviceSide : "0" = middle, "1" = mallet 1 service zone, "2" = mallet 2 service zone
function Place (serviceSide : int)
{
	
			
	while( gamePause == true )
    {
    	yield;
    }
	
	// Set rigidbody to kinematic
	myRb.isKinematic = true;
	
	myTr.localEulerAngles = Vector3.zero;
	
	if (serviceSide == 0) myTr.localPosition = Vector3(0, myTr.localPosition.y, 0);
	else
	if (serviceSide == 1) myTr.localPosition = Vector3(0, myTr.localPosition.y, - 0.6);
	else
	if (serviceSide == 2) myTr.localPosition = Vector3(0, myTr.localPosition.y, 0.6);

	yield;
	
	myRb.isKinematic = false;
	
	// Stop the velocity
	myRb.velocity = myRb.angularVelocity = Vector3.zero;
	
}

function OnCollisionEnter(collisionInfo : Collision)
{

	// Check the collision object's tag to detect if we hit the bounds
    if (collisionInfo.gameObject.tag != "Mallet" && gameObject.active == true) audio.Play();
    
}