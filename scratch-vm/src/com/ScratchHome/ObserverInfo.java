package src.com.ScratchHome;

import com.eteks.sweethome3d.model.ObserverCamera;


/**
 * a class providing the correct position of Observer's sprite in Scratch 
 * using current position of Home's Observer Camera.
 *
 */
public class ObserverInfo {
	
	private float x = 0; // Observer Camera's Abscess
	private float y = 0; // Observer Camera's Ordinate
	private float direction = 0; //Observer Camera's Direction

	private ObserverCamera obs = null; // Observer Camera
	
	// Constructor with Observer Camera
	public ObserverInfo(ObserverCamera obs) {
		this.obs = obs;
	}

	// get the Correct abscess
	public float getX() {
		this.setInfo();
		return x;
	}

	// get the Correct ordinate
	public float getY() {
		this.setInfo();
		return y;
	}

	// get the Correct direction
	public float getDirection() {
		this.setInfo();
		return direction;
	}
	
	private void setInfo() {
		
		//Adapt x y and direction to match Scratch's View.
		if (obs != null) {
			x = -240+(obs.getX()+ 200)*480/((float)JSONAction.width);
			y = 180+(-obs.getY() +60)*360/((float) JSONAction.height);
			direction = (float) (obs.getYaw()*180/Math.PI - 90);
		}
	}

	
	
}
