sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./MaterialController",
	"../image/ImageController",
], function (Controller, MessageToast, MessageBox, JSONModel, MaterialController, ImageController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.material.MaterialEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("materialEditRoute").attachMatched(this._onRouteMatched, this);
			
			MaterialController.initializeUnitComboBox(this.getView().byId("unitComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.W
			this.getView().setModel(null, "selectedMaterial");
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, true);
			
			this.resetUIElements();			
			this.initializeImageMetaDataModel();
			this.initializeImageDisplayModels();
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("materialComboBox").getSelectedKey() == "") {
				var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("materialEdit.noMaterialSelected"));
				return;
			}
			
			MaterialController.validatePriceInput(this.getView().byId("priceInput"), this.getOwnerComponent().getModel("i18n").getResourceBundle(),
				this.getView().getModel("selectedMaterial"), "/pricePerUnit");
				
			if(this.getView().byId("unitComboBox").getSelectedKey() == "") {
				var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("materialEdit.noUnitSelected"));
				return;
			}
			
			if(MaterialController.isPriceValid(this.getView().byId("priceInput").getValue()) == false)
				return;
				
			MaterialController.saveMaterialByWebService(this.getView().getModel("selectedMaterial"),
				this.saveMaterialCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
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
			var oImageForDisplayModel = this.getView().getModel("newImage");
			
			oFileUploader.setUploadUrl(sWebServiceBaseUrl + "/data");
			
			oFileUploader.checkFileReadable().then(function() {
				oImageMetaDataModel.setProperty("/mimeType", oFile.type);
				oImageForDisplayModel.setProperty("/mimeType", oFile.type);
				oFileUploader.upload();
			}, function() {
				MessageToast.show(oResourceBundle.getText("materialEdit.imageNotAccessable"));
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
					this.setNewImageIdOfMaterialModel(oReturnData.data);
					this.updateImageMetaData(oReturnData.data);
					ImageController.queryImageDataByWebService(oReturnData.data, this.queryNewImageDataCallback, this);
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
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oMaterials = this.getView().getModel("materials");
			var oMaterial, oWsMaterial;
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
						
			oMaterial = MaterialController.getMaterialById(oSelectedItem.getKey(), oMaterials.oData.material);
			oWsMaterial = this.getMaterialForWebService(oMaterial);
				
			//Set the model of the view according to the selected material to allow binding of the UI elements.
			this.getView().setModel(oWsMaterial, "selectedMaterial");
			
			//Reset the model that stores the image of the previously selected material.
			this.initializeImageDisplayModels();
			
			//Query the image of the selected material if the material has an image ID referenced.
			if(oMaterial.image != null && oMaterial.image.id != null) {
				ImageController.queryImageDataByWebService(oMaterial.image.id, this.queryOldImageDataCallback, this);
				ImageController.queryImageMetaDataByWebService(oMaterial.image.id, this.queryOldImageMetaDataCallback, this);
			}
			else {
				//If the material has no image attached, reset the image and display nothing.
				this.getView().byId("materialImageOld").setSrc(null);
			}
			
			//Manually set the price of the Input field because the price is not directly bound due to validation reasons.
			this.setPriceInputValue(oMaterial.pricePerUnit);
		},
		
		
		/**
		 * Initializes the JSON models that store data of the images to be displayed.
		 */
		initializeImageDisplayModels : function () {
			var oOldImageDisplayModel = new JSONModel();
			var oNewImageDisplayModel = new JSONModel();
			
			oOldImageDisplayModel.loadData("model/image/imageForDisplay.json");
			this.getView().setModel(oOldImageDisplayModel, "oldImage");
			
			oNewImageDisplayModel.loadData("model/image/imageForDisplay.json");
			this.getView().setModel(oNewImageDisplayModel, "newImage");
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
		 * Displays the old image if both the data and mime type of the image are available.
		 */
		displayOldImage : function(oCallingController) {
			var sImageData;
			var oOldImageDisplayModel = oCallingController.getView().getModel("oldImage")
			var sImageData = oOldImageDisplayModel.getProperty("/data");
			var sMimeType = oOldImageDisplayModel.getProperty("/mimeType");
			
			if(sImageData == "")
				return;
				
			if(sMimeType == "")
				return;
			
			sImageData = "data:" + sMimeType + ";base64," + sImageData;
			oCallingController.getView().byId("materialImageOld").setSrc(sImageData);
		},
		
		
		/**
		 * Displays the new image if both the data and mime type of the image are available.
		 */
		displayNewImage : function(oCallingController) {
			var sImageData;
			var oNewImageDisplayModel = oCallingController.getView().getModel("newImage")
			var sImageData = oNewImageDisplayModel.getProperty("/data");
			var sMimeType = oNewImageDisplayModel.getProperty("/mimeType");
			
			if(sImageData == "")
				return;
				
			if(sMimeType == "")
				return;
			
			sImageData = "data:" + sMimeType + ";base64," + sImageData;
			oCallingController.getView().byId("materialImageNew").setSrc(sImageData);
		},
		
		
		/**
		 * Callback function of the queryMaterial RESTful WebService call in the MaterialController.
		 */
		queryMaterialsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
						
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("materialEdit.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(data.message[0].text);
			}                                                          
	
			oCallingController.getView().setModel(oModel, "materials");
		},
		
		
		/**
		 *  Callback function of the saveMaterial RESTful WebService call in the MaterialController.
		 */
		saveMaterialCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new material data.
					MaterialController.queryMaterialsByWebService(oCallingController.queryMaterialsCallback, oCallingController, false);
					//Clear selectedMaterial because no ComboBox item is selected.
					oCallingController.getView().setModel(null, "selectedMaterial");
					oCallingController.resetUIElements();
					oCallingController.resetImageSources(oCallingController);
					oCallingController.resetModelData();
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'I') {
					MessageToast.show(oReturnData.message[0].text);
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
		 * Callback function of the queryImageData RESTful WebService call in the ImageController.
		 */
		queryOldImageDataCallback : function (oReturnData, oCallingController) {
			var oOldImageDisplayModel = oCallingController.getView().getModel("oldImage")
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
				return;
			}                                                               
			
			oOldImageDisplayModel.setProperty("/data", oReturnData.data.data);
			oCallingController.displayOldImage(oCallingController);
		},
		
		
		/**
		 * Callback function of the queryImageMetaData RESTful WebService call in the ImageController.
		 */
		queryOldImageMetaDataCallback : function (oReturnData, oCallingController) {
			var oOldImageDisplayModel = oCallingController.getView().getModel("oldImage")
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
				return;
			}                                                               
			
			oOldImageDisplayModel.setProperty("/mimeType", oReturnData.data.mimeType);
			oCallingController.displayOldImage(oCallingController);
		},
		
		
		/**
		 * Callback function of the queryImageData RESTful WebService call in the ImageController.
		 */
		queryNewImageDataCallback : function (oReturnData, oCallingController) {
			var oNewImageDisplayModel = oCallingController.getView().getModel("newImage")
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
				return;
			}                                                               
			
			oNewImageDisplayModel.setProperty("/data", oReturnData.data.data);
			oCallingController.displayNewImage(oCallingController);
		},
		
		
		/**
		 * Callback function of the saveImageMetaDataByWebService RESTful WebService call in the ImageController.
		 */
		updateMetaDataCallback : function (oReturnData) {
			if(oReturnData.message[0].type == 'E') {
				MessageBox.error(oReturnData.message[0].text);
			}
			
			if(oReturnData.message[0].type == 'W') {
				MessageBox.warning(oReturnData.message[0].text);
			}
		},
		
		
		/**
		 * Sets the value of the priceInput.
		 */
		setPriceInputValue : function(fValue) {
			this.getView().byId("priceInput").setValue(fValue);
			this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
		},
		
		
		/**
		 * Sets the new image ID of the selected materials model.
		 */
		setNewImageIdOfMaterialModel : function (iImageId) {
			var oMaterialModel = this.getView().getModel("selectedMaterial");
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
		 * Creates a representation of a material that can be processed by the WebService.
		 */
		getMaterialForWebService : function(oMaterial) {
			var wsMaterial = new JSONModel();			

			wsMaterial.setProperty("/materialId", oMaterial.id);
			wsMaterial.setProperty("/name", oMaterial.name);
			wsMaterial.setProperty("/description", oMaterial.description);
			wsMaterial.setProperty("/inventory", oMaterial.inventory);
			wsMaterial.setProperty("/unit", oMaterial.unit);
			wsMaterial.setProperty("/pricePerUnit", oMaterial.pricePerUnit);
			wsMaterial.setProperty("/currency", oMaterial.currency);
			
			if(oMaterial.image != null)
				wsMaterial.setProperty("/imageId", oMaterial.image.id);
			
			return wsMaterial;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("materialComboBox").setSelectedItem(null);
			this.getView().byId("idText").setText("");
			this.getView().byId("nameInput").setValue("");
			this.getView().byId("descriptionTextArea").setValue("");
			this.getView().byId("unitComboBox").setSelectedItem(null);
			this.setPriceInputValue(0);
			this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("inventoryInput").setValue("0");
			this.getView().byId("materialImageOld").setSrc(null);
		},
		
		
		/**
		 * Resets model data.
		 */
		resetModelData : function () {
			this.initializeImageDisplayModels();
			this.initializeImageMetaDataModel();
		},
		
		
		/**
		 * Resets the source of the images. No image is displayed then.
		 */
		resetImageSources : function () {
			this.getView().byId("materialImageNew").setSrc(null);
			this.getView().byId("materialImageOld").setSrc(null);
		}
	});
});