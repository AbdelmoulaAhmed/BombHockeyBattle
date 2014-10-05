
// UI BUTTON SCRIPT JS 20140803_1302 //

#pragma strict

// Each UI button has a unique ID number
var buttonNumber : int = 0;

var mainScript : MainScript;

// For options buttons containing numeric value
var isNumericOptionButton : boolean = false;

// Enabling highlighting effect ?
var highlighting : boolean = true;

// The numeric option's actual value
var optionValue : int;

// Array of number object meshes
var numericOption : GameObject[];

function Start ()
{
	
	// Check for saved values
	if (buttonNumber == 3 && PlayerPrefs.HasKey ("Game scoreToWin")) optionValue = PlayerPrefs.GetInt("Game scoreToWin");
	if (buttonNumber == 4 && PlayerPrefs.HasKey ("Game difficulty")) optionValue = PlayerPrefs.GetInt("Game difficulty");
	
	
	// Check if it is an option button
	if (isNumericOptionButton == true)
	{
		// Send the option value of the button to the main Script to ensure to have the same value on both
		mainScript.UiEventOptionButton (buttonNumber, optionValue);
		
		// Init the display of the value
		UpdateNumericOptionDisplay();
	}
	
}

function OnEnable ()
{

	transform.localPosition.z = 0; // Reset the position

}

// If button is clicked up we call a function in "MainScript"
// Note this function has no effect on touch screen devices and is called after a raycast in "MainScript"'s Update function
function OnMouseUp ()
{	

	// Check if it is a simple button or a option button with numeric value
	if (isNumericOptionButton == false)
	{
		// Call function "UiEventButton" in "MainScript"
    	mainScript.UiEventButton (buttonNumber);
    }
    
    // Object is an numeric option button, call the function "ProcessNumericOption"
    else ProcessNumericOption ();
    
}

// On touch screen devices this function has no effect and is called after a raycast in "MainScript"'s Update function
function OnMouseOver ()
{	
	
	// Change the local position to create a highlighting effect
    if (highlighting == true) transform.localPosition.z = 0.02;
    yield WaitForSeconds(0.2);
    
}

// On touch screen devices this function has no effect and is called after a raycast in "MainScript"'s Update function
function OnMouseExit ()
{

	// call "MoveButton()" wich manages moves effect
	 if (highlighting == true) MoveButton (0.02, 0, 0.1);
   
}

// This function process numeric option button's behavior
// It manages the UI display, then send is value to "MainScript"
function ProcessNumericOption()
{
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
		mainScript.UiEventOptionButton (buttonNumber, optionValue);
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
		mainScript.UiEventOptionButton (buttonNumber, optionValue);
	}
	
}

function UpdateNumericOptionDisplay()
{

	// Disable all numeric objects renderers
	for (var i=0; i<numericOption.Length; i++) { numericOption[i].renderer.enabled = false;	}
	
	// Enable the renderer of the coresponding UI number object
	numericOption[optionValue].renderer.enabled = true;

}

// This function manages the button's move effect
function MoveButton (startPos : float, endPos : float, time : float)
{

	var i = 0.0;
	var rate = 1.0/time;
	
	// Lerp the transform's local position from "startPos" to "endPos" at the given speed "time"
	while (i < 1.0)
	{
		i += Time.deltaTime * rate;
		transform.localPosition.z = Mathf.Lerp(startPos, endPos, i);
		yield;
    }
    
}