
// UI BUTTON SCRIPT CS 20140803_1302 //

using UnityEngine;
using System.Collections;

public class UiButtonScriptCS : MonoBehaviour {
	
	// Each UI button has a unique ID number
	public int buttonNumber = 0;
	
	public MainScriptCS mainScript;
	
	// For options buttons containing numeric value
	public bool isNumericOptionButton = false;
	
	// Enabling highlighting effect ?
	public bool highlighting = true;
	
	// The numeric option's actual value
	public int optionValue;
	
	// Array of number object meshes
	public GameObject[] numericOption;
	
	
	// WIP IS THE BUTTON ALREADY IN USE ? // CHECK : http://forum.unity3d.com/threads/iphone-touch-phase-began-and-hittest-repeating.77027/
	private bool buttonIsUsed = false;
	
	void Start ()
	{
		
		// Check for saved values
		if (buttonNumber == 3 && PlayerPrefs.HasKey ("Game scoreToWin")) optionValue = PlayerPrefs.GetInt("Game scoreToWin");
		if (buttonNumber == 4 && PlayerPrefs.HasKey ("Game difficulty")) optionValue = PlayerPrefs.GetInt("Game difficulty");
		
		// Check if it is an option button
		if (isNumericOptionButton == true)
		{
			// Send the option value of the button to the main Script to ensure to have the same value on both
			StartCoroutine(mainScript.UiEventOptionButton (buttonNumber, optionValue));
			
			// Init the display of the value
			UpdateNumericOptionDisplay();
		}
		
	}
	
	void OnEnable ()
	{
	
		transform.localPosition = new Vector3 (transform.localPosition.x, transform.localPosition.y, 0); // Reset the position
	
	}
	
	// If button is clicked up we call a function in "MainScript"
	// Note this function has no effect on touch screen devices and is called after a raycast in "MainScript"'s Update function
	IEnumerator OnMouseUp ()
	{	
		
		// Performing a debug log with Unity remote could be handy
		Debug.Log ("UIButtonScriptCS : " + "OnMouseUp()", gameObject);
		
		if (buttonIsUsed == true) yield return null;
		else buttonIsUsed = true;
		
		// Check if it is a simple button or a option button with numeric value
		if (isNumericOptionButton == false)
		{
			// Call function "UiEventButton" in "MainScript"
	    	mainScript.UiEventButton(buttonNumber);
	    }
	    
	    // Object is an numeric option button, call the function "ProcessNumericOption"
	    else ProcessNumericOption();
		
		yield return buttonIsUsed = false;
	    
	}
	
	// On touch screen devices this function has no effect and is called after a raycast in "MainScript"'s Update function
	IEnumerator OnMouseOver ()
	{	
		
		// Change the local position to create a highlighting effect
	    if (highlighting == true) transform.localPosition = new Vector3(transform.localPosition.x, transform.localPosition.y, 0.02f);
	    yield return new WaitForSeconds(0.2f);
	    
	}
	
	// On touch screen devices this function has no effect and is called after a raycast in "MainScript"'s Update function
	void OnMouseExit ()
	{
	
		// call "MoveButton()" wich manages moves effect
		if (highlighting == true) StartCoroutine(MoveButton(0.02f, 0, 0.1f));
	   
	}
	
	// This function process numeric option button's behavior
	// It manages the UI display, then send is value to "MainScript"
	void ProcessNumericOption()
	{
		
		// Performing a debug log with Unity remote could be handy
		Debug.Log ("UIButtonScriptCS : " + "ProcessNumericOption()", gameObject);
		
		// if this object is the "Score to win" option button
		if (buttonNumber == 3)
		{
			// update the score to win option variable
			if (optionValue == 9) optionValue = 3;
			else if (optionValue == 3) optionValue = 5;
			else if (optionValue == 5) optionValue = 7;
			else if (optionValue == 7) optionValue = 9;
			
			// Save the new preset in Player Preferences
			PlayerPrefs.SetInt("Game scoreToWin", optionValue);
			
			//Manage the UI display with function "UpdateNumericOptionDisplay"
			UpdateNumericOptionDisplay ();
			
			// Call function "UiEventOptionButton" in "MainScript", and send it the option value
			StartCoroutine(mainScript.UiEventOptionButton (buttonNumber, optionValue));
		}
		
		else
		
		// if this object is the "Difficulty" option button
		if (buttonNumber == 4)
		{
			// update the score to win option variable
			if (optionValue == 5) optionValue = 1;
			else optionValue = optionValue + 1;
			
				// Save the new preset in Player Preferences
			PlayerPrefs.SetInt("Game difficulty", optionValue);
			
			//Manage the UI display with function "UpdateNumericOptionDisplay"
			UpdateNumericOptionDisplay ();
			
			// Call function "UiEventOptionButton" in "MainScript", and send it the option value
			StartCoroutine(mainScript.UiEventOptionButton (buttonNumber, optionValue));
		}
		
	}
	
	void UpdateNumericOptionDisplay()
	{
	
		// Disable all numeric objects renderers
		for (var i=0; i<numericOption.Length; i++) { numericOption[i].renderer.enabled = false;	}
		
		// Enable the renderer of the coresponding UI number object
		numericOption[optionValue].renderer.enabled = true;
	
	}
	
	// This function manages the button's move effect
	IEnumerator MoveButton (float startPos, float endPos, float time)
	{
	
		float i = 0;
		float rate = 1.0f/time;
		
		// Lerp the transform's local position from "startPos" to "endPos" at the given speed "time"
		while (i < 1.0f)
		{
			i += Time.deltaTime * rate;
			transform.localPosition = new Vector3(transform.localPosition.x, transform.localPosition.y, Mathf.Lerp(startPos, endPos, i));
			yield return null;
	    }
	    
	}
	
}
