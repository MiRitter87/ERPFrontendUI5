sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"./MaterialController"
], function (Controller, JSONModel, MessageBox, MessageToast, MaterialController) {
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
		_onRouteMatched: function (oEvent) {
			this.getView().byId("unitComboBox").setSelectedItem(null);
			this.initializeMaterialModel();
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
			
			MaterialController.createMaterialbyWebService(
				this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material"), 
				this.getView().getModel("newMaterial"), this.saveMaterialCallback, this);
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
		 * Resets the form fields to the initial state.
		 */
		resetFormFields : function () {
			this.getView().byId("unitComboBox").setSelectedItem(null);
			this.getView().byId("priceInput").setValue(0);
			this.initializeMaterialModel();
		},
	});
});