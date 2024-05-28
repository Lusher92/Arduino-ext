package src.com.ScratchHome;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.ObserverCamera;

/**
 * The Listener to modification of Camera.
 *
 */
public class CameraListener implements PropertyChangeListener {

	@Override
	public void propertyChange(PropertyChangeEvent evt) {
		
		Camera newCam = (Camera) evt.getNewValue();
		//if the new Camera is an Observer,
		// then a Listener to modification of its position is added.
		if (newCam instanceof ObserverCamera) {
			System.out.println("there is an observer camera added");
			newCam.addPropertyChangeListener(new PositionCameraListener());
			
		}
	}

}
