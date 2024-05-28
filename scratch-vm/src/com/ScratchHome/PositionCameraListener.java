package src.com.ScratchHome;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import com.eteks.sweethome3d.model.ObserverCamera;

/**
 * The Listener to modification of Observer Camera's position.
 *
 */
public class PositionCameraListener implements PropertyChangeListener {

	@Override
	public void propertyChange(PropertyChangeEvent evt) {

		// TODO Auto-generated method stub
		String property = evt.getPropertyName();
		ObserverCamera obs = (ObserverCamera) evt.getSource();
		Object newValue = evt.getNewValue();
		
		// get the old values of position and direction
		float x = obs.getX();
		float y = obs.getY();
		float direction = obs.getYaw();
		
		// update the value of property changed
		if (property.equals("X")) {
			x = (Float) newValue;
		}else if (property.equals("Y")) {
			y = (Float) newValue;
		}else if (property.equals("YAW")) {
			direction = (Float) newValue;
		}
		
		// send the new triple to Scratch with position change automatically or not
		String result = "position/"+x+"/"+y+"/"+direction;
		
		if (ControlPanel.automatic) {
			result = result + "/automatic";
		}
		
		if (ControlPanel.sendToScratch) {
			SendToScratch.sendMessage(result);
		}
	}

}
