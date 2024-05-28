package src.com.ScratchHome;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileFilter;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.Light;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.plugin.PluginAction;
import com.eteks.sweethome3d.viewcontroller.HomeController;

/**
 *Create a SB3 file (actually a ZIP), that is the Scratch project format, by creating a JSON and SVG to represent SH3D scene's objects
 *
 */
public class JSONAction extends PluginAction{

	private Home home; //representing the 3D scene
	private HashMap<String, String> language; //list of plugin languages 
	JFileChooser chooser = new JFileChooser();
	private HomeController controller; //get view methods
	private String pluginsPath; // get the plugins folder path so we can import the Sprite's SVG file.
	public static double width; // width of the SVG file
	public static double height; // height of the SVG file
	Properties properties; //SH3D properties (ie. user language)
		
    /**
     * Method called by launching JSONAction in the plugin menu. If the 3D scene is not empty, calls the function to create the JSON.
     *
     */
	public void execute() {
		if(!(home.getFurniture().isEmpty())) {
			try {
				createJSON(this.home);
			} catch (Exception e) {
				JOptionPane.showMessageDialog(null,"Une exception a �t� rencontr�e.\nVeuillez la signaler sur le github du projet\nhttps://github.com/technologiescollege/ScratchHome/issues\nLe message d'erreur :\n"+getStackTrace(e));
			}
		} else {
			JOptionPane.showMessageDialog(null,language.get("NoObject"));
		}
	}
	
	public static String getStackTrace(Throwable aThrowable) {
	    final Writer result = new StringWriter();
	    final PrintWriter printWriter = new PrintWriter(result);
	    aThrowable.printStackTrace(printWriter);
	    return result.toString();
	}
	
	/**
	 * JSONAction Constructor.
	 * @param home representing the 3D scene.
	 * @param language the list of plugin languages.
	 * @param general_properties SH3D properties (ie. user language).
	 * @param controller to get view methods.
	 */
	public JSONAction(Home home, HashMap<String, String> language, String pluginsPath,Properties general_properties, HomeController controller) {
		this.home = home;
		this.language = language;
		this.pluginsPath = pluginsPath;
		this.properties = general_properties;
		this.controller= controller; 
		putPropertyValue(Property.NAME, language.get("ExportMenu"));
		putPropertyValue(Property.MENU, language.get("ScratchHome"));
		// Enables the action by default
		setEnabled(true);
	} 

	/**
	 * Method to create JSON file representing SH3D scene objects and putting it in a SB3 file which is the Scratch project format.
	 * Creating also a SVG picture, added to the SB3 file, representing the SH3D scene for watching it in Scratch project.
	 *
	 * @param home representing the 3D scene.
	 */
	public void createJSON(Home home) {
		//A JSwing window to ask what export : all objects or only lights
		boolean allObject = false;
		String propertiesAllObject = properties.getProperty("allObject");
		if(propertiesAllObject.equals("OFF")){
			Object[] options = { language.get("AllObjects"), language.get("OnlyLights") };
			int reply = JOptionPane.showOptionDialog(null, language.get("ChoiceOfExport"), language.get("ObjectSelection"),  JOptionPane.DEFAULT_OPTION, JOptionPane.PLAIN_MESSAGE, null, options, options[0]);
			if (reply == JOptionPane.YES_OPTION)
			{
				allObject = true;
			}
			if (reply == JOptionPane.CLOSED_OPTION){
				return;
			}
		}else {
			allObject = propertiesAllObject.equals("ALL");
		}
		
		//A JSwing window to ask how export : all objects in only one Scratch block or one block per object
		boolean menuDeroulant = false;
		String propertiesMenu = properties.getProperty("menu");
		if (propertiesMenu.equals("OFF")) {
			Object[] options2 = { language.get("PulldownMenuBlock"), language.get("SingleBlock")};
			int reply2 = JOptionPane.showOptionDialog(null, language.get("TypeOfBlockChoice"), language.get("TypeOfBlock"),  JOptionPane.DEFAULT_OPTION, JOptionPane.PLAIN_MESSAGE, null, options2, options2[0]);
			if (reply2 == JOptionPane.YES_OPTION)
			{
				menuDeroulant = true;
			}
			if (reply2 == JOptionPane.CLOSED_OPTION){
				return;
			}
		}else {
			menuDeroulant = propertiesMenu.equals("MENU");
		}

		//A lists to add current 3D scene objects and lights
		ArrayList<String> listElemObject = new ArrayList<String>();
		ArrayList<String> listElemLight = new ArrayList<String>();
		
		//Adding objects to the previous lists
		for (HomePieceOfFurniture fourniture : home.getFurniture()) {
			
			if(fourniture.getDescription() == null) {
				fourniture.setDescription(""+fourniture.hashCode());
			}
			
			// add lights whatever they are only choosed or not.
			if(fourniture instanceof Light){
				listElemLight.add(fourniture.getName()+"("+fourniture.getDescription()+")");
			}
			if(allObject==true){
				listElemObject.add(fourniture.getName()+"("+fourniture.getDescription()+")");
			}
		}

		// the lists of objects, and lights that will be added to SB3 files in String form 
		// in order to help Scratch extension creating blocks for each objects/lights.
		
		StringBuffer vocStringBufferObject = new StringBuffer();
		StringBuffer vocStringBufferLamp = new StringBuffer();
		
		// a variable to add to SB3 file indicating the option choosed by user 
		// in order to help Scratch Extension to create correspondent blocks.
		String typeBlocks = "blocksSimples";
		if(menuDeroulant){
			typeBlocks = "menuDeroulant";
		} 
		
		// add lights if exists to its correspondent list
		if (listElemLight.size() > 0) {
			vocStringBufferLamp.append("[\""+listElemLight.get(0)+"\"");
			for( int i = 1; i < ((listElemLight.size())); i++){
				vocStringBufferLamp.append(",\""+listElemLight.get(i)+"\"");
			}
			vocStringBufferLamp.append("]");
		}else {
			vocStringBufferLamp.append("[]");			
		}

		//if all objects were chosen
		if (allObject==true){
				vocStringBufferObject.append("[\""+listElemObject.get(0)+"\"");
				for( int i = 1; i < ((listElemObject.size())); i++){
					vocStringBufferObject.append(",\""+listElemObject.get(i)+"\"");
				}
				vocStringBufferObject.append("]");
				
		}else {
			vocStringBufferObject.append("[]");
		}
		

		//Below the code to deal with the File filter window in order to create the Sb3 file (with a call to writeFile function)
		this.chooser.setFileFilter(new FileFilter()
		{
			@Override
			public boolean accept(File f)
			{
				return f.isDirectory() || f.getName().toLowerCase().endsWith(".sb3");
			}

			@Override
			public String getDescription() 
			{
				return language.get("SB3Extension");
			}
		});

		int n = chooser.showSaveDialog(null);

		if (n==JFileChooser.APPROVE_OPTION) {
			String chemin = this.chooser.getSelectedFile().toString();
			//check if user has written ".sb3" at the end of its file and let it or remove it 
			if(chemin.substring(chemin.length()-4, chemin.length()).equals(".sb3")) {
				//writeFile function is called to create a true SB3 file (that is a .zip actually)
				this.writeFile(vocStringBufferObject.toString(),vocStringBufferLamp.toString(),typeBlocks, chemin, false);
			} else {
				this.writeFile(vocStringBufferObject.toString(),vocStringBufferLamp.toString(),typeBlocks, chemin+".sb3", false);
			}
		} 
	}

	/**
	 * Method writing lists with other informations in a file (by overwriting it or concatenating it).
	 *
	 * @param listObject the list of objects to write.
	 * @param listLamp the list of lamps to write.
	 * @param typeBlocks variable indicating type of blocks.
	 * @param filename the name of the file.
	 * @param append true if the text is to append at the end of the file, false otherwise.
	 */
	private void writeFile (String listObject, String listLamp, String typeBlocks, String filename, boolean append) {
		//we create a zip file, that contains the JSON and a SVG picture
		String text = "";
		try {
			ZipOutputStream zos = new ZipOutputStream(
					new FileOutputStream(filename));
			
			// add the SVG file of Home's 2Dview

						ZipEntry svg = new ZipEntry("cd21514d0531fdffb22204e0ec5ed84a.svg");
						zos.putNextEntry(svg);

						
						String tempdir = System.getProperty("java.io.tmpdir");
						try {
							//get a SVG picture of the SH3D 2D scene
							controller.getView().exportToSVG(tempdir+"/project.svg");
						} catch (RecorderException e) {
							e.printStackTrace();
						}
						
			//resizing the SVG because Scratch needs a 480x360 SVG
			try {
				//get the SVG file (which is a XML file)
				String filepath = tempdir+"/project.svg";
				DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
				DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
				Document doc = docBuilder.parse(filepath);
		
				//get the svg element by tag name directly
				Node svgNode = doc.getElementsByTagName("svg").item(0);

				//get width attribute value (and remove non numeric characters because the whole value finishes with "px")
				NamedNodeMap attr = svgNode.getAttributes();
				Node nodeAttr = attr.getNamedItem("width");
				width = Double.parseDouble(nodeAttr.getTextContent().replaceAll("\\D", ""));
				//get height attribute value
				nodeAttr = attr.getNamedItem("height");
				height = Double.parseDouble(nodeAttr.getTextContent().replaceAll("\\D", ""));
				
				//calculate best scale factor both for width and height
				double x1 = 480/width;
				double x2 = 360/height;
				//keep the lower value to be sure the SVG won't be trimmed
				double xmin = Math.min(x1, x2);
				
				//get the first g node in the xml file
				Node gNode1 = doc.getElementsByTagName("g").item(0);
				//add transform attribute to this node with the right scale factor
				((Element)gNode1).setAttribute("transform","scale("+xmin+")");
				
				//write the content into svg file
				TransformerFactory transformerFactory = TransformerFactory.newInstance();
				Transformer transformer = transformerFactory.newTransformer();
				DOMSource source = new DOMSource(doc);
				StreamResult result = new StreamResult(new File(filepath));
				transformer.transform(source, result);

			} catch (ParserConfigurationException pce) {
				pce.printStackTrace();
			} catch (TransformerException tfe) {
				tfe.printStackTrace();
			} catch (IOException ioe) {
				ioe.printStackTrace();
			} catch (SAXException sae) {
				sae.printStackTrace();
			}	
			
			//adding the SVG file to the SB3
			FileInputStream fis = null;
			try {
				fis = new FileInputStream(tempdir+"/project.svg");
				byte[] byteBuffer = new byte[1024];
				int bytesRead = -1;
				while ((bytesRead = fis.read(byteBuffer)) != -1) {
					zos.write(byteBuffer, 0, bytesRead);
				}
				zos.flush();
			} finally {
				try {
					fis.close();
				} catch (Exception e) {
				}
			}
			zos.closeEntry();
			
			// get the current infos of Observer Camera
			ObserverInfo obsinfo = new ObserverInfo(home.getObserverCamera());
			
			float x = obsinfo.getX();
			float y = obsinfo.getY();
			float direction = obsinfo.getDirection();
			
			//Below the text to write in the JSON in order to be considered as correct for a Scratch project
			//its Create a sprite for Observer Camera and associate to it the objectList, lampList, typeBlocks 
			// and width and height of its SVG file, then set its position (x,y) and direction with infos got above.
			
			text = "{\"targets\":[{\"isStage\":true,\"name\":\"Stage\",\"variables\":{},\"lists\":{},\"broadcasts\":{},\"blocks\":{},\"comments\":{},\"currentCostume\":0,\"costumes\":[{\"assetId\":\"cd21514d0531fdffb22204e0ec5ed84a\",\"name\":\"arrière plan1\",\"md5ext\":\"cd21514d0531fdffb22204e0ec5ed84a.svg\",\"dataFormat\":\"svg\",\"rotationCenterX\":240,\"rotationCenterY\":180}],\"sounds\":[],\"volume\":100,\"layerOrder\":0,\"tempo\":60,\"videoTransparency\":50,\"videoState\":\"on\",\"textToSpeechLanguage\":null},{\"isStage\":false,\"name\":\"Observer\",\"variables\":{\"L^i{fNhE#uQ8.g=D;O~O\":[\"typeBlocks\",\""
											+ typeBlocks+"\"],\"9YR=}_qqo.V|FmE2ZCj~\":[\"height_SH3D\","
													+ (int) Math.round(height)+"],\"Cg-Li`$:dyXAI+Umru~+\":[\"width_SH3D\","
															+ (int) Math.round(width) +"]},\"lists\":{\"CNn7j*SP0QT%rN4=j[xz\":[\"objectList\","
											+ listObject+"],\"GoN|030ruZ,{H+4$)C-$\":[\"lampList\","
													+ listLamp+"]},\"broadcasts\":{},\"blocks\":{},\"comments\":{},\"currentCostume\":0,\"costumes\":[{\"assetId\":\"bcf454acf82e4504149f7ffe07081dbc\",\"name\":\"costume1\",\"bitmapResolution\":1,\"md5ext\":\"bcf454acf82e4504149f7ffe07081dbc.svg\",\"dataFormat\":\"svg\",\"rotationCenterX\":8,\"rotationCenterY\":8}],\"sounds\":[],\"volume\":100,\"layerOrder\":1,\"visible\":true,\"x\":"
															+ x+",\"y\":"
																	+ y+",\"size\":200,\"direction\":"
																			+ direction+",\"draggable\":false,\"rotationStyle\":\"all around\"}],\"monitors\":[],\"extensions\":[],\"meta\":{\"semver\":\"3.0.0\",\"vm\":\"0.2.0\",\"agent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0\"}}";


			ZipEntry json = new ZipEntry("project.json");
			zos.putNextEntry(json);
			
			byte[] data = text.getBytes();
			zos.write(data, 0, data.length);

			zos.closeEntry(); //don't forget to close the entry
			
			
			//load the Sprite's SVG and add it to the zip
			ZipEntry svg_sprite = new ZipEntry("bcf454acf82e4504149f7ffe07081dbc.svg");
			zos.putNextEntry(svg_sprite);
			
			FileInputStream fis_sprite = null;
			try {
				fis_sprite = new FileInputStream(pluginsPath+"/ScratchHome_sprite.svg");
				byte[] byteBuffer = new byte[1024];
				int bytesRead = -1;
				while ((bytesRead = fis_sprite.read(byteBuffer)) != -1) {
					zos.write(byteBuffer, 0, bytesRead);
				}
				zos.flush();
			} catch(FileNotFoundException ex) {
				// notify user that sprite's SVG file doesn't exists in plugins foder.
				JOptionPane.showMessageDialog(null, "Sprite SVG file doesn't exists in your plugin folder.\n Please add a file named ScratchHome_sprite in the folder : "+this.pluginsPath, "Sprite SVG doesn't exists", JOptionPane.INFORMATION_MESSAGE);
			}finally {
				try {
					fis_sprite.close();
				} catch (Exception e) {
				}
			}
			zos.closeEntry(); // close entry
			zos.close();
			
			
		} catch (IOException e) {
			e.printStackTrace();
		}
	}	

	/**
	 * Method to reload plugin language 
	 * 
	 * @param language 
	 */
	public void reload(HashMap<String, String> language) {
		this.language = language;
		putPropertyValue(Property.NAME, language.get("ExportMenu"));
		putPropertyValue(Property.MENU, language.get("ScratchHome"));
	}
}
