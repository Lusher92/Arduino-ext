package src.com.ScratchHome;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.util.HashMap;

import javax.swing.JOptionPane;

import com.eteks.sweethome3d.model.Home;

/**
 * 
 * Listen actions sent by Scratch in order to modify the SH3D scene
 *
 */
public class ScratchListener implements Runnable{


	private static final int PORT = 2016; // set to your extension's port number
	
	private static DataInputStream sockIn;
	private static DataOutputStream sockOut;

	public static boolean running = true;
	private ServerSocket serverSock = null;
	


	private Home home;
	private ControlPanel controlpanel;
	private HashMap<String, String> language;


	/**
	 * ScratchListener constructor
	 * @param home The scene of SweetHome3D, containing all the objects
	 * @param controlpanel The view of the control panel, to modify its content 
	 * @param language The Hashmap containing the content of the language file
	 */
	public ScratchListener (Home home, ControlPanel controlpanel, HashMap<String, String> language) {
		this.home = home;
		this.controlpanel = controlpanel;
		this.language = language;
	}

	/**
	 * Get if the server is running or not
	 * @return return true if the server is still running 
	 */
	public boolean isRunning() {
		return running;
	}

	/**
	 * Function terminating the listening server
	 */
	public void terminate()  {
		running = false;
		try {
			serverSock.close();
		} catch (IOException e) {}
		controlpanel.changeStatus(false);
	}


	/**
	 * Start the listening server
	 */
	public void run() {
		controlpanel.changeStatus(true);
		try {
			controlpanel.changeMessage(language.get("ServerLaunched"));
			serverSock = new ServerSocket(PORT);
			running = true;	
			
			while (running) {
				try {
					Socket sock = serverSock.accept();
					sockIn = new DataInputStream(sock.getInputStream());
					sockOut = new DataOutputStream(sock.getOutputStream());  
					try {
						handleRequest();
					} catch (Exception e) {
						e.printStackTrace(System.err);
					}
					sock.close();
					sockIn.close();
					sockOut.close();
				}catch(SocketException e){}

				if (!running)
					break;
			}
			controlpanel.changeMessage(language.get("ServerTerminated"));

		} catch (IOException e) {
			JOptionPane.showMessageDialog(null,getStackTrace(e));
		}
	}
	public static String getStackTrace(Throwable aThrowable) {
	    final Writer result = new StringWriter();
	    final PrintWriter printWriter = new PrintWriter(result);
	    aThrowable.printStackTrace(printWriter);
	    return result.toString();
	}

	/**
	 * Function to handle incoming messages from Scratch
	 * (Thanks to the A4S github project for having the code, see at https://github.com/damellis/A4S) 
	 * @throws IOException
	 */
	private void handleRequest() throws IOException {
		int i;

		String header = (String)sockIn.readUTF();
		if (header.indexOf("GET ") != 0) {
			System.err.println("This server only handles HTTP GET requests.");
			return;
		}
		i = header.indexOf("HTTP/1");
		if (i < 0) {
			System.err.println("Bad HTTP GET header.");
			return;
		}
		header = header.substring(5, i - 1);

		System.out.println("header : "+header);
		if (header.equals("favicon.ico")) return;
		else if (header.equals("crossdomain.xml")) sendPolicyFile();
		else if (header.equals("poll")) sendResponse("");
		else if (header.equals("reset_all")) return;
		else doCommand(header);
	}
	/**
	 * Function to say to Scratch that the server is up and running
	 * It is called if the listening server catch a crossdomain request
	 */
	private static void sendPolicyFile() {
		// Send a Flash null-teriminated cross-domain policy file.
		String policyFile =
				"<cross-domain-policy>\n" +
						"  <allow-access-from domain=\"*\" to-ports=\"" + PORT + "\"/>\n" +
						"</cross-domain-policy>\n\0";
		sendResponse(policyFile);
	}
	/**
	 * Send a response to Scratch
	 * @param response the message to send (it encapsulate it with http header)
	 */
	public static void sendResponse(String response) {
		try {
			sockOut.writeUTF(response);
		} catch (Exception ignored) { }
	}
	/**
	 * Method using the action from Scratch to change the home in SH3D
	 * @param cmdAndArgs The action from Scratch
	 */
	private void doCommand(String cmdAndArgs) {

		cmdAndArgs= cmdAndArgs.replaceAll("%2F", "/");
		String[] cmd = cmdAndArgs.split("/"); 

		if(cmd[0].startsWith("setColor")) {

			cmd[1] = cmd[1].replaceAll("%..", "");
			String name = cmd[1].substring(0,cmd[1].indexOf("("));
			cmd[1] = cmd[1].substring(cmd[1].indexOf("(")+1,cmd[1].indexOf(")"));

			int color = 0;
			cmd[2] = cmd[2].toLowerCase();
			if (cmd[2].equals("black")) {
				color = -15000000;
			}
			if (cmd[2].equals("blue")) {
				color = -16776961;
			}
			if (cmd[2].equals("cyan")) {
				color = -16711681;
			}
			if (cmd[2].equals("grey")) {
				color = -7829368;
			}
			if (cmd[2].equals("green")) {
				color = -16711936;
			}
			if (cmd[2].equals("magenta")) {
				color = -65281;
			}
			if (cmd[2].equals("red")) {
				color = -65536;
			}
			if (cmd[2].equals("white")) {
				color = -1;
			}
			if (cmd[2].equals("yellow")) {
				color = -256;
			}
			controlpanel.changeMessage(cmd[0]+" -- "+name+" -- "+cmd[2]+" -- "+color);

			HomeModifier.changeColor(cmd[1], color, this.home);
			sendResponse(cmd[0]+" -- "+name+" -- "+cmd[2]+" -- "+color);
		}else if (cmd[0].startsWith("switchOnOff")) {
			//bloc :   	SwitchOnOff/ID/Allumer
			//list :	SwitchOnOff/Allumer/ID
			
			int color = 0;
			String modifier = "";
			String hash = ""; 
			String name = "";
			if(cmd[1].equals("Switch On") || cmd[1].equals("Switch Off")){

				cmd[2] = cmd[2].replaceAll("%..", "");
				name = cmd[2].substring(0,cmd[2].indexOf("("));
				cmd[2] = cmd[2].substring(cmd[2].indexOf("(")+1,cmd[2].indexOf(")"));
				hash = cmd[2];
				modifier = cmd[1];
			} else {
				cmd[1] = cmd[1].replaceAll("%..", "");
				cmd[1] = cmd[1].replaceAll("[\\D]", "");
				hash = cmd[1];
				modifier = cmd[2];
			}
			
			modifier = modifier.toLowerCase();
			if (modifier.equals("switch on")) {
				color = -256;
			}
			if (modifier.equals("switch off")) {
				color = -15000000;
			}
			controlpanel.changeMessage("switchOnOff -- "+modifier+" -- "+name);
			HomeModifier.changeColor(hash, color, this.home);
			sendResponse("switchOnOff -- "+modifier+" -- "+name);

		// reset the color of an object
		}else if (cmd[0].startsWith("reset")) {

			cmd[1] = cmd[1].replaceAll("%..", "");
			String name = cmd[1].substring(0,cmd[1].indexOf("("));
			cmd[1] = cmd[1].substring(cmd[1].indexOf("(")+1,cmd[1].indexOf(")"));

			controlpanel.changeMessage(cmd[0]+" -- "+name);
			HomeModifier.resetColor(cmd[1], this.home);
			sendResponse(cmd[0]+" -- "+name);
			
		// set Observer Camera's Position by the position received from Scratch
		}else if (cmd[0].startsWith("position")) {
			float x = Float.parseFloat(cmd[1]);
			float y = Float.parseFloat(cmd[2]);
			float direction = Float.parseFloat(cmd[3]);
			
			HomeModifier.changePosition(x, y, direction, home);
			sendResponse("position Observer Camera updated");
			
		// else its an invalid request
		}else {
			sendResponse("invalid request");
		}
	}

}
