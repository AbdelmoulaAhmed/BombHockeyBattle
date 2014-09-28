#pragma strict
var vitesseDeplacement=0.02;

function Start () {

}

function Update () {
//Test des touches du clavier
if(Input){
		rigidbody.AddForce(Input.GetAxis("Horizontal")* 10 * vitesseDeplacement * Time.deltaTime,0,0);
	}else{
	rigidbody.AddForce(0,0,0);
	}
	
}