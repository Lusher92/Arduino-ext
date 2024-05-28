package src.com.ScratchHome;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;

/**
 *  
 *Modify SH3D objects properties (colors of objects and position of Observer Camera)
 *
 */
public class HomeModifier {
	public static void changeColor(String hash, int color, Home home) {
		for (HomePieceOfFurniture fourniture : home.getFurniture()) {
			
			if(fourniture.getDescription() != null)
				if(fourniture.getDescription().equals(hash)) {
					try {
						fourniture.setColor(color);
					}catch(java.lang.IllegalStateException e) {
						
						// notify user if the color of fourniture can't be changed
						ScratchListener.sendResponse("Object is not able to be colored");
					}
				}
					
		}
	}
	
	public static void resetColor(String hash, Home home) {
		for (HomePieceOfFurniture fourniture : home.getFurniture()) {
			if(fourniture.getDescription() != null)
				if(fourniture.getDescription().equals(hash)) {
					fourniture.setColor(null);					
				}					
		}
	}

	public static void changePosition(float x, float y, float direction, Home home) {
		home.getObserverCamera().setX(x);
		home.getObserverCamera().setY(y);
		home.getObserverCamera().setYaw(direction);
	}
}