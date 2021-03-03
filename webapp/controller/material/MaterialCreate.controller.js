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
			
			this.saveMaterialByWebService();
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
		 * Saves the material defined in the input form by using the RESTful WebService.
		 */
		saveMaterialByWebService : function () {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oMaterialModel = this.getView().getModel("newMaterial");
			var sJSONData = oMaterialModel.getJSON();
			
			//Use "POST" to create a resource.
			var aData = jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data, textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
							this.resetFormFields();
						}
						
						if(data.message[0].type == 'E') {
							MessageBox.error(data.message[0].text);
						}
						
						if(data.message[0].type == 'W') {
							MessageBox.warning(data.message[0].text);
						}
					}
				},
				context : this
			});    
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