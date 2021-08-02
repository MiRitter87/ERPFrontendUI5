sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"./BusinessPartnerController"
], function (Controller, JSONModel, MessageBox, MessageToast, BusinessPartnerController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.businessPartner.BusinessPartnerCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("businessPartnerCreateRoute").attachMatched(this._onRouteMatched, this);
			
			BusinessPartnerController.initializeTypeComboBox(this.getView().byId("typeComboBox"),
				this.getOwnerComponent().getModel("i18n").getResourceBundle());		
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			this.initializeBusinessPartnerModel();
    	},


		/**
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeBusinessPartnerModel : function () {
			var oBusinessPartnerModel = new JSONModel();
			
			oBusinessPartnerModel.loadData("model/businessPartner/businessPartnerCreate.json");
			this.getView().setModel(oBusinessPartnerModel, "newBusinessPartner");
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			BusinessPartnerController.createBusinessPartnerByWebService(this.getView().getModel("newBusinessPartner"), 
				this.saveBusinessPartnerCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");
		},
		
		
		/**
		 * Callback function of the saveBusinessPartner RESTful WebService call in the BusinessPartnerController.
		 */
		saveBusinessPartnerCallback : function (oReturnData, callingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					callingController.initializeBusinessPartnerModel();
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			} 
		},
	});
});