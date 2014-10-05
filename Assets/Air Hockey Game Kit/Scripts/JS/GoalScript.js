
//GOAL SCRIPT JS 20140619_1242 //

#pragma strict

var goalNumber : int = 1;	// the goal number (side 1 or 2) 
var goalIndicatorAnim : Animation; 
//var puck : GameObject; // unused
var mainScript : MainScript;

// is the game paused ?
var gamePause : boolean = false;

// "OnPauseGame()" and "OnResumeGame()" are called by "MainScript" when hitting the pause key or button

function OnPauseGame ()
{

	gamePause = true;

}

function OnResumeGame ()
{

	gamePause = false;

}



function Goal()
{

	while( gamePause == true )
    {
    	yield;
    }
	
	audio.Play();
    
    // Play the fading texture animation attached to the children object "Goal Indicator" 
    goalIndicatorAnim.Play();
    
    // notify "MainScript" that there is a score update
    mainScript.UpdateScore(goalNumber);
	
}

function OnTriggerEnter (other : Collider)
{   

    Goal();
    
}

