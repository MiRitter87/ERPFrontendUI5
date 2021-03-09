sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./MaterialController"
], function (Controller, MessageToast, MessageBox, JSONModel, MaterialController) {
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
			//Query material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			this.getView().setModel(new JSONModel());
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, true);
			
			this.getView().byId("unitComboBox").setSelectedItem(null);
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("unitComboBox").getSelectedKey() == "") {
				var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("materialEdit.noUnitSelected"));
				return;
			}
			
			MaterialController.validatePriceInput(this.getView().byId("priceInput"), this.getOwnerComponent().getModel("i18n").getResourceBundle(),
				this.getView().getModel(), "/selectedMaterial/pricePerUnit");
			if(MaterialController.isPriceValid(this.getView().byId("priceInput").getValue()) == false)
				return;
				
			MaterialController.saveMaterialByWebService(new JSONModel(this.getView().getModel().getProperty("/selectedMaterial")),
				this.saveMaterialCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
			this.getView().byId("materialComboBox").setSelectedItem(null);
			this.setPriceInputValue(null);
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oMaterials = oModel.oData.materials;
			var oMaterial;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected material from the array of all materials according to the id.
			for(var i = 0; i < oMaterials.data.material.length; i++) {
    			var oTempMaterial = oMaterials.data.material[i];
    			
				if(oTempMaterial.id == oSelectedItem.getKey()) {
					oMaterial = oTempMaterial;
				}
			}
			
			//Set the model of the view according to the selected material to allow binding of the UI elements.
			oModel.setData({selectedMaterial : oMaterial}, true);
			
			//Manually set the price of the Input field because the price is not directly bound due to validation reasons.
			this.setPriceInputValue(oMaterial.pricePerUnit);
		},
		
		
		/**
		 * Callback function of the queryMaterial RESTful WebService call in the MaterialController.
		 */
		queryMaterialsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = oCallingController.getView().getModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			oModel.setData({materials : oReturnData}, true);
			
			if(oReturnData.data != null) {
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("materialEdit.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(data.message[0].text);
			}                                                          
	
			oCallingController.getView().setModel(oModel);
		},
		
		
		/**
		 *  Callback function of the saveMaterial RESTful WebService call in the MaterialController.
		 */
		saveMaterialCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new material data.
					MaterialController.queryMaterialsByWebService(oCallingController.queryMaterialsCallback, oCallingController, false);
					//Clear ComboBox preventing display of wrong data (Id - Name).
					oCallingController.getView().byId("materialComboBox").setSelectedKey(null);
					//Clear selectedMaterial because no ComboBox item is selected.
					oCallingController.getView().getModel().setProperty("/selectedMaterial", null);
					//Clear the price which is not directly bound to the model.
					oCallingController.setPriceInputValue(null);
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
		 * Sets the value of the priceInput.
		 */
		setPriceInputValue : function(fValue) {
			this.getView().byId("priceInput").setValue(fValue);
		}
	});
});