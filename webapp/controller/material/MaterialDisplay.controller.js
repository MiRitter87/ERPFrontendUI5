sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"./MaterialController",
	"../image/ImageController",
], function (Controller, MessageToast, JSONModel, MaterialController, ImageController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.material.MaterialDisplay", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("materialDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this);
			this.resetUiElements();
			this.getView().byId("priceObjectNumber").setVisible(false);
    	},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oMaterials = this.getView().getModel("materials");
			var oMaterial;
			var oMaterialModel = new JSONModel();
			
			if(oSelectedItem == null)
				return;
				
			oMaterial = MaterialController.getMaterialById(oSelectedItem.getKey(), oMaterials.oData.material);
			oMaterialModel.setData(oMaterial);
			
			//Set the model of the view according to the selected material to allow binding of the UI elements.
			this.getView().setModel(oMaterialModel, "selectedMaterial");
			this.getView().byId("priceObjectNumber").setVisible(true);
			
			//Reset the model that stores the image of the previously selected material.
			this.initializeImageDisplayModel();
			
			//Query the image of the selected material if the material has an image ID referenced.
			if(oMaterial.image != null && oMaterial.image.id != null) {
				ImageController.queryImageDataByWebService(oMaterial.image.id, this.queryImageDataCallback, this);
				ImageController.queryImageMetaDataByWebService(oMaterial.image.id, this.queryImageMetaDataCallback, this);
			}
			else {
				//If the material has no image attached, reset the image and display nothing.
				this.getView().byId("materialImage").setSrc(null);
			}
		},
		
		
		/**
		 * Initializes the JSON Model that stores data of the image to be displayed.
		 */
		initializeImageDisplayModel : function () {
			var oImageDisplayModel = new JSONModel();
			
			oImageDisplayModel.loadData("model/image/imageForDisplay.json");
			this.getView().setModel(oImageDisplayModel, "imageForDisplay");
		},
		
		
		/**
		 * Displays the image if both the data and mime type of the image are available.
		 */
		displayImage : function(oCallingController) {
			var sImageData;
			var oImageDisplayModel = oCallingController.getView().getModel("imageForDisplay")
			var sImageData = oImageDisplayModel.getProperty("/data");
			var sMimeType = oImageDisplayModel.getProperty("/mimeType");
			
			if(sImageData == "")
				return;
				
			if(sMimeType == "")
				return;
			
			sImageData = "data:" + sMimeType + ";base64," + sImageData;
			oCallingController.getView().byId("materialImage").setSrc(sImageData);
		},
		
		
		/**
		 * Callback function of the queryMaterial RESTful WebService call in the MaterialController.
		 */
		queryMaterialsCallback : function (oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
						
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				MessageToast.show(oResourceBundle.getText("materialDisplay.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}

			oCallingController.getView().setModel(oModel, "materials");
		},
		
		
		/**
		 * Callback function of the queryImageData RESTful WebService call in the ImageController.
		 */
		queryImageDataCallback : function (oReturnData, oCallingController) {
			var oImageDisplayModel = oCallingController.getView().getModel("imageForDisplay")
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
				return;
			}                                                               
			
			oImageDisplayModel.setProperty("/data", oReturnData.data.data);
			oCallingController.displayImage(oCallingController);
		},
		
		
		/**
		 * Callback function of the queryImageMetaData RESTful WebService call in the ImageController.
		 */
		queryImageMetaDataCallback : function (oReturnData, oCallingController) {
			var oImageDisplayModel = oCallingController.getView().getModel("imageForDisplay")
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
				return;
			}                                                               
			
			oImageDisplayModel.setProperty("/mimeType", oReturnData.data.mimeType);
			oCallingController.displayImage(oCallingController);
		},
		
		
		/**
		 * Resets UI elements.
	     * Image and ComboBox for material selection.
		 */
		resetUiElements : function () {
			this.getView().byId("materialComboBox").setSelectedItem(null);
			this.getView().byId("idText").setText("");
			this.getView().byId("nameText").setText("");
			this.getView().byId("descriptionText").setText("");
			this.getView().byId("unitText").setText("");
			this.getView().byId("inventoryText").setText("");
			this.getView().byId("materialImage").setSrc(null);
		}
	});
});