package src.com.ScratchHome;

import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

/**
 * a class sending data to Scratch.
 *
 */
public class SendToScratch {
	public static void sendMessage(String message) {

		System.out.println("sendToScratch : "+message);
		
		// if the server is runing then send message to Scratch
		if (ScratchListener.running) {
			try {
				Socket masocket = new Socket("localhost",2022);
				DataOutputStream out= new DataOutputStream(masocket.getOutputStream());
				out.writeUTF(message);
				masocket.close();
				
			} catch (UnknownHostException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}		
		}
		
	}
}
