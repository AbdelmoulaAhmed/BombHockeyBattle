
// UI SCORE SCRIPT CS 20140619_1242 //


using UnityEngine;
using System.Collections;

public class UiScoreScriptCS : MonoBehaviour {
		
	// These are the numeric font object meshes
	public GameObject[] numericOptionP1;
	public GameObject[] numericOptionP2;
	
	public Material scoreBaseMat; // The base score material
	public Material scoreFxMat; // The highlighted score material
	
	
	public void ResetUIScore ()
	{
		
		// Disable all numeric objects renderers
		for (var i=0; i<numericOptionP1.Length; i++) { numericOptionP1[i].renderer.enabled = false; numericOptionP2[i].renderer.enabled = false; }
		// Enable number "0" renderer
		numericOptionP1[0].renderer.enabled = numericOptionP2[0].renderer.enabled = true;
		
	}
	
	public void UpdateUIScore (int player, int score)
	{
	
		// Disable all numbers but the one we want to be displayed
		
		if (player == 1)
		{
			for (int i=0; i<numericOptionP1.Length; i++)
			{
				if (i != score) numericOptionP1[i].renderer.enabled = false;
				else { numericOptionP1[i].renderer.enabled = true; StartCoroutine(BumpScore(numericOptionP1[i].transform, 0.01f, 0, 0.3f)); }
			}
		}
		
		else
		
		if (player == 2)
		{
			for (int i=0; i<numericOptionP2.Length; i++)
			{
				if (i != score) numericOptionP2[i].renderer.enabled = false;
				else { numericOptionP2[i].renderer.enabled = true; StartCoroutine(BumpScore(numericOptionP2[i].transform, 0.01f, 0, 0.3f)); }
			}
		}
		
	}
	
	// This function manages the button's move effect
	IEnumerator BumpScore (Transform scoreTr, float startPos, float endPos, float time)
	{
	
		scoreTr.renderer.material = scoreFxMat; // Hghlight the new score
		
		float i = 0;
		float rate = 1.0f/time;
		
		// Lerp the transform's local position from "startPos" to "endPos" at the given speed "time"
		while (i < 1.0f)
		{
			i += Time.deltaTime * rate;
			scoreTr.localPosition = new Vector3(scoreTr.localPosition.x, scoreTr.localPosition.y, Mathf.Lerp(startPos, endPos, i));
			yield return null;
	    }
	    
	    scoreTr.renderer.material = scoreBaseMat;
    
	}
	
}
