
var cible:Transform;
var Balle:Transform;
var faireFeu;
function Start () {

}

function Update () {
	var rotate=Quaternion.LookRotation(cible.position - transform.position);
	transform.rotation=Quaternion.Slerp(transform.rotation , rotate ,Time.deltaTime*1);
	var temps:int= Time.time;
	var cadence=(temps%4);
		if(cadence){
		tir(temps);
		}
}
function tir(temps){
	if(temps!=faireFeu){
	var tirer=Instantiate(Balle,transform.Find("depart").transform.position,Quaternion.identity);
	tirer.rigidbody.AddForce(transform.forward *30000);
	faireFeu=temps;
	}
}





















