#pragma strict
var vitesseDeplacement=0.02;

function Start () {

}

function Update () {
//Test des touches du clavier
if(Input){
		rigidbody.AddForce(Input.GetAxis("Horizontal")* 1 * vitesseDeplacement * Time.deltaTime,0,0);
		rigidbody.AddForce(0,0,Input.GetAxis("Vertical")* 1 * vitesseDeplacement * Time.deltaTime);
		
	}else{
	rigidbody.AddForce(0,0,0);

	}
	
}