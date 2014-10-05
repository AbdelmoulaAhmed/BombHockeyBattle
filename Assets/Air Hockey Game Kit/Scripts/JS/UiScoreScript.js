

// UI SCORE SCRIPT JS 20140619_1242 //

#pragma strict

// These are the numeric font object meshes
var numericOptionP1 : GameObject[];
var numericOptionP2 : GameObject[];

var scoreBaseMat : Material; // The base score material
var scoreFxMat : Material; // The highlighted score material


function ResetUIScore ()
{
	
	// Disable all numeric objects renderers
	for (var i=0; i<numericOptionP1.Length; i++) { numericOptionP1[i].renderer.enabled = false; numericOptionP2[i].renderer.enabled = false; }
	// Enable number "0" renderer
	numericOptionP1[0].renderer.enabled = numericOptionP2[0].renderer.enabled = true;
	
}

function UpdateUIScore (player : int, score : int)
{

	// Disable all numbers but the one we want to be displayed
	
	if (player == 1)
	{
		for (var i=0; i<numericOptionP1.Length; i++)
		{
			if (i != score) numericOptionP1[i].renderer.enabled = false;
			else { numericOptionP1[i].renderer.enabled = true; BumpScore (numericOptionP1[i].transform, 0.01, 0, 0.3); }
		}
	}
	
	else
	
	if (player == 2)
	{
		for (i=0; i<numericOptionP2.Length; i++)
		{
			if (i != score) numericOptionP2[i].renderer.enabled = false;
			else { numericOptionP2[i].renderer.enabled = true; BumpScore (numericOptionP2[i].transform, 0.01, 0, 0.3); }
		}
	}
	
}

// This function manages the button's move effect
function BumpScore (scoreTr : Transform, startPos : float, endPos : float, time : float)
{

	scoreTr.renderer.material = scoreFxMat; // Hghlight the new score
	
	var i = 0.0;
	var rate = 1.0/time;
	
	// Lerp the transform's local position from "startPos" to "endPos" at the given speed "time"
	while (i < 1.0)
	{
		i += Time.deltaTime * rate;
		scoreTr.localPosition.z = Mathf.Lerp(startPos, endPos, i);
		yield;
    }
    
    scoreTr.renderer.material = scoreBaseMat;
    
}