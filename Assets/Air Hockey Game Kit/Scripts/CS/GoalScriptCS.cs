
//GOAL SCRIPT CS 20140619_1242 //

using UnityEngine;
using System.Collections;

public class GoalScriptCS : MonoBehaviour {

	
	public int goalNumber = 1;	// the goal number (side 1 or 2) 
	public Animation goalIndicatorAnim; 
	//public GameObject puck; // unused
	public MainScriptCS mainScript;
	
	// is the game paused ?
	public bool gamePause = false;

	// "OnPauseGame()" and "OnResumeGame()" are called by "MainScript" when hitting the pause key or button
	
	void OnPauseGame ()
	{
	
		gamePause = true;
	
	}
	
	void OnResumeGame ()
	{
	
		gamePause = false;
	
	}
	
	
	
	IEnumerator Goal()
	{
	
		while( gamePause == true )
	    {
	    	yield return null;
	    }
		
		audio.Play();
	    
	    // Play the fading texture animation attached to the children object "Goal Indicator" 
	    goalIndicatorAnim.Play();
	    
	    // notify "MainScript" that there is a score update
		mainScript.StartCoroutine(mainScript.UpdateScore(goalNumber));
		
	}

	
	void OnTriggerEnter (Collider other)
	{   
	
	     StartCoroutine(Goal());
	    
	}
}
