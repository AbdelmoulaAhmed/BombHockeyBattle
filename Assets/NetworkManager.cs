using UnityEngine;
using System.Collections;

public class NetworkManager : MonoBehaviour {

	// Use this for initialization
	void Start () {
		Connect ();
	}

	void Connect(){
		PhotonNetwork.ConnectUsingSettings ("v1.0.0");
	}

	void OnGUI(){
		GUILayout.Label (PhotonNetwork.connectionStateDetailed.ToString());
	}

	void OnJoinedLobby(){
		PhotonNetwork.JoinRandomRoom (); 
	}

	void OnPhotonRandomJoinFailed(){
		Debug.Log ("Join Random Room Failed");
		PhotonNetwork.CreateRoom (null);
	}

	void OnJoinedRoom(){
		Debug.Log ("Join New Room");
	}
}
