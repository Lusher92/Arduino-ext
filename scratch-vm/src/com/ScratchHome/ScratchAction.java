package src.com.ScratchHome;

import java.util.HashMap;

import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.ObserverCamera;
import com.eteks.sweethome3d.plugin.PluginAction;
import com.eteks.sweethome3d.swing.HomeComponent3D;
import com.eteks.sweethome3d.viewcontroller.HomeController;

/**
 * Allow the listening of Scratch' actions and modifications on SH3D scene
 * 
 */
public class ScratchAction extends PluginAction {

	private boolean instanciate = true;
	
	private HashMap<String, String> language;
	
	private Home home;
	private HomeController controller;
	public static PositionCameraListener PosCamListener;
	private ClickListener clickListener;
	private Thread thread = null;
	private Thread control = null;
	private ControlPanel controlPanel = null;
	private ScratchListener scratchListener = null;
	private Process processus1 = null;

	/**
	 * Method called by launching ScratchAction in the plugin menu. If not launched already, launch the server listening Scratc actions.
	 * 
	 */
	public void execute() {
		//instanciate is true when the server is already launched
		if(instanciate) {
			controlPanel = new ControlPanel(this, language);
			scratchListener = new ScratchListener(home, controlPanel, language);
			thread = new Thread(scratchListener);
			thread.start();
			
			// Launch Python Server
			launchServer();
			
			// launch Listeners
			launchListeners();
			
			control = new Thread(controlPanel);
			control.start();
			instanciate = false;
		}
		setEnabled(false);

	}
	
	/**
	 * Method to close the server
	 * 
	 */
	public void closeListener() {
		scratchListener.terminate();
		if (processus1 != null && processus1.isAlive()) {
			processus1.destroy();
			processus1 = null;
		}
		closeListeners();	
	}

	/**
	 * Method that allow to instanciate again the server
	 * 
	 */
	public void reInstanciate() {
		instanciate = true;
		setEnabled(true);
	}
	
	/**
	 * Method that launch again the server
	 * 
	 */
	public void reupListener() {
		if (!scratchListener.isRunning()) {
			
			scratchListener = new ScratchListener(home, controlPanel, language);
			thread = new Thread(scratchListener);
			thread.start();

			// Launch Python Server
			launchServer();
			
			// Launch Listeners
			launchListeners();
			
		}
	}
	
	/**
	 * ScratchAction constructor
	 * 
	 * @param home representing the 3D scene. 
	 * @param language the list of plugin languages.
	 */
	public ScratchAction(Home home, HashMap<String, String> language, HomeController controller) {
		this.home = home;
		this.controller = controller;
		this.language = language;
		putPropertyValue(Property.NAME, language.get("ScratchActionMenu"));
		putPropertyValue(Property.MENU, language.get("ScratchHome"));

		setEnabled(true);
	}

	/**
	 * Method to reload plugin language 
	 * 
	 * @param language 
	 */
	public void reload(HashMap<String, String> language) {
		this.language = language;
		putPropertyValue(Property.NAME, language.get("ScratchActionMenu"));
		putPropertyValue(Property.MENU, language.get("ScratchHome"));
	}
	
	/**
	 * Method to launch Python Server
	 * 
	 */
	private void launchServer() {

		String commandServer = System.getProperty("os.name").startsWith("Windows") ? ScratchHomePlugin.pluginsPath+"/ScratchHome_Server.exe" : "python3 "+ScratchHomePlugin.pluginsPath+"/ScratchHome_Server.py";
				
		try{
			if (processus1 != null && processus1.isAlive()) {
				return;
			}else {
				processus1 = Runtime.getRuntime().exec(commandServer); 					
			}
		}catch(Exception e){
			e.printStackTrace();
		} 
		
	}

	private void launchListeners() {
				// get the current camera, if the new Camera is an Observer,
				// then a Listener to modification of its position is added.
				Camera cam = home.getCamera();
				if (cam instanceof ObserverCamera) {
					PosCamListener = new PositionCameraListener();
					((ObserverCamera) cam).addPropertyChangeListener(PosCamListener);
				}
				
				// add a mouse listener to click events on Home's Component3D
				HomeComponent3D comp3D = (HomeComponent3D) controller.getHomeController3D().getView();
				clickListener = new ClickListener();
				comp3D.addMouseListener(clickListener);
	}
	
	private void closeListeners() {
		// get the current camera, if the Camera is an Observer,
		// then remove the Listener to modification of its position is added.
		Camera cam = home.getCamera();
		if (cam instanceof ObserverCamera) {
			((ObserverCamera) cam).removePropertyChangeListener(PosCamListener);
		}
		
		// add a mouse listener to click events on Home's Component3D
		HomeComponent3D comp3D = (HomeComponent3D) controller.getHomeController3D().getView();
		comp3D.removeMouseListener(clickListener);
	}

}
