package src.com.ScratchHome;

import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;

import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.swing.HomeComponent3D;

/**
 * The Mouse Listener to event click on Component3D of Home.
 *
 */
public class ClickListener implements MouseListener {
	
	@Override
	public void mouseClicked(MouseEvent e) {
	
		System.out.println("mouse is clicked");
		int x = e.getX();
	    int y = e.getY();
	    HomeComponent3D comp = (HomeComponent3D) e.getSource();
	    
	    // get the closet Selectable to the point clicked with mouse
	    Selectable closetSelectable = comp.getClosestItemAt(x,y);
	    
	    // if it's a HomePieceOfFurniture, then send the name of clicked piece to Scratch
	    if (closetSelectable instanceof HomePieceOfFurniture) {
	    	HomePieceOfFurniture piece = (HomePieceOfFurniture) closetSelectable;
		    System.out.println("closet piece : " +piece.getName());
		    
		    String result = "click/"+piece.getName()+"("+piece.getDescription()+")";
		    SendToScratch.sendMessage(result);
	    }
	}

	// do not change other override methods
	
	@Override
	public void mousePressed(MouseEvent e) {

	}

	@Override
	public void mouseReleased(MouseEvent e) {

	}

	@Override
	public void mouseEntered(MouseEvent e) {

	}

	@Override
	public void mouseExited(MouseEvent e) {

	}

}
