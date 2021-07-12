sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"./MaterialController",
	"../image/ImageController",
], function (Controller, JSONModel, MessageBox, MessageToast, MaterialController, ImageController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.material.MaterialCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oView, oMessageManager, oRouter;
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("materialCreateRoute").attachMatched(this._onRouteMatched, this);
			
			//Initialize message manager for input form validation.
			oView = this.getView();
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");
			oMessageManager.registerObject(oView, true);
			
			MaterialController.initializeUnitComboBox(this.getView().byId("unitComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			this.getView().byId("unitComboBox").setSelectedItem(null);
			this.getView().byId("materialImage").setSrc(null);
			this.initializeMaterialModel();
			this.initializeImageMetaDataModel();
			this.initializeImageDisplayModel();
    	},
		
		
		/**
		 * Handles the press-event of the image file upload button.
		 */
		onUploadPressed: function () {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/image");
			var oFileUploader = this.byId("imageFileUploader");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oFile = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
			var oImageMetaDataModel = this.getView().getModel("imageMetaData");
			var oImageForDisplayModel = this.getView().getModel("imageForDisplay");
			
			oFileUploader.setUploadUrl(sWebServiceBaseUrl + "/data");
			
			oFileUploader.checkFileReadable().then(function() {
				oImageMetaDataModel.setProperty("/mimeType", oFile.type);
				oImageForDisplayModel.setProperty("/mimeType", oFile.type);
				oFileUploader.upload();
			}, function(error) {
				MessageToast.show(oResourceBundle.getText("materialCreate.imageNotAccessable"));
			}).then(function() {
				oFileUploader.clear();
			});
		},	
		
		
		/**
		 * Handles the uploadComplete-event of the image file uploader.
		 */
		onUploadComplete: function (oControlEvent) {
			var oReturnData = JSON.parse(oControlEvent.getParameter("responseRaw"));
			
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					this.setImageIdOfMaterialModel(oReturnData.data);
					this.updateImageMetaData(oReturnData.data);
					ImageController.queryImageDataByWebService(oReturnData.data, this.queryImageDataCallback, this);
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			} 
		},		
		
		
		/**
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeMaterialModel : function () {
			var oMaterialModel = new JSONModel();
			
			oMaterialModel.loadData("model/material/materialCreate.json");
			this.getView().setModel(oMaterialModel, "newMaterial");
		},
		
		
		/**
		 * Initializes the model for image meta data.
	     */
		initializeImageMetaDataModel : function () {
			var oImageMetaDataModel = new JSONModel();
			
			oImageMetaDataModel.loadData("model/image/metaDataUpdate.json");
			this.getView().setModel(oImageMetaDataModel, "imageMetaData");
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
		 * Sets the image ID of the model for material creation.
		 */
		setImageIdOfMaterialModel : function (iImageId) {
			var oMaterialModel = this.getView().getModel("newMaterial");
			oMaterialModel.setProperty("/imageId", iImageId);
		},
		

		/** 
		 * Updates the meta data of the image using the backend WebService.
		 */		
		updateImageMetaData : function(iImageId) {
			var oImageMetaDataModel = this.getView().getModel("imageMetaData");
			
			oImageMetaDataModel.setProperty("/id", iImageId);
			ImageController.saveImageMetaDataByWebService(oImageMetaDataModel, this.updateMetaDataCallback, this);
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("unitComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedUnit();
				return;
			}
			
			MaterialController.validatePriceInput(this.getView().byId("priceInput"), this.getOwnerComponent().getModel("i18n").getResourceBundle(),
				this.getView().getModel("newMaterial"), "/pricePerUnit");
			if(MaterialController.isPriceValid(this.getView().byId("priceInput").getValue()) == false)
				return;				
			
			MaterialController.createMaterialbyWebService(this.getView().getModel("newMaterial"), this.saveMaterialCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Displays a message in case the unit has not been selected.
		 */
		showMessageOnUndefinedUnit : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("materialCreate.noUnitSelected"));
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
		 * Callback function of the saveMaterial RESTful WebService call in the MaterialController.
		 */
		saveMaterialCallback : function (oReturnData, callingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					//"this" is unknown in the success function of the ajax call. Therefore the calling controller is provided.
					callingController.resetFormFields();
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			} 
		},
		
		
		/**
		 * Callback function of the saveImageMetaDataByWebService RESTful WebService call in the ImageController.
		 */
		updateMetaDataCallback : function (oReturnData, callingController) {
			if(oReturnData.message[0].type == 'E') {
				MessageBox.error(oReturnData.message[0].text);
			}
			
			if(oReturnData.message[0].type == 'W') {
				MessageBox.warning(oReturnData.message[0].text);
			}
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
		 * Resets the form fields to the initial state.
		 */
		resetFormFields : function () {
			this.getView().byId("unitComboBox").setSelectedItem(null);
			this.getView().byId("priceInput").setValue(0);
			this.initializeMaterialModel();
		},
	});
});