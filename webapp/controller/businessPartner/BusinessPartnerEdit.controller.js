sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"./BusinessPartnerController",
	"../MainController"
], function (Controller, JSONModel, MessageToast, MessageBox, BusinessPartnerController, MainController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.businessPartner.BusinessPartnerEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("businessPartnerEditRoute").attachMatched(this._onRouteMatched, this);
			
			BusinessPartnerController.initializeTypeComboBox(this.getView().byId("typeComboBox"),
				this.getOwnerComponent().getModel("i18n").getResourceBundle());	
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query business partner data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, true, "ALL");
			
			this.resetUIElements();	
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("businessPartnerComboBox").getSelectedKey() == "") {
				var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("businessPartnerEdit.noBusinessPartnerSelected"));
				return;
			}
				
			BusinessPartnerController.saveBusinessPartnerByWebService(this.getView().getModel("selectedBusinessPartner"),
				this.saveBusinessPartnerCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this), this.getOwnerComponent().getModel("navigation"));
		},
		
		
		/**
		 * Handles the selection of an item in the business partner ComboBox.
		 */
		onBusinessPartnerSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oBusinessPartners = this.getView().getModel("businessPartners");
			var oBusinessPartner;
			var oBusinessPartnerModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.getView().setModel(oBusinessPartnerModel, "selectedBusinessPartner");
				this.resetUIElements();				
				return;
			}
				
			oBusinessPartner = BusinessPartnerController.getBusinessPartnerById(oSelectedItem.getKey(), oBusinessPartners.oData.businessPartner);
			oBusinessPartnerModel.setData(oBusinessPartner);
			
			//Set the model of the view according to the selected business partner to allow binding of the UI elements.
			this.getView().setModel(oBusinessPartnerModel, "selectedBusinessPartner");
		},
		
		
		/**
		 * Callback function of the queryBusinessPartners RESTful WebService call in the BusinessPartnerController.
		 */
		queryBusinessPartnersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("businessPartnerEdit.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(data.message[0].text);
			}                                                          
	
			oCallingController.getView().setModel(oModel, "businessPartners");
		},
		
		
		/**
		 *  Callback function of the saveBusinessPartner RESTful WebService call in the BusinessPartnerController.
		 */
		saveBusinessPartnerCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new business partner data.
					BusinessPartnerController.queryBusinessPartnersByWebService(oCallingController.queryBusinessPartnersCallback, oCallingController, false, "ALL");
					//Clear ComboBox preventing display of wrong data (Id - Name).
					oCallingController.resetUIElements();
					//Clear selectedBusinessPartner because no ComboBox item is selected.
					oCallingController.getView().setModel(null, "selectedBusinessPartner");
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
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("businessPartnerComboBox").setSelectedItem(null);
			
			this.getView().byId("typeComboBox").setSelectedKeys(null);
			this.getView().byId("idText").setText("");

			this.getView().byId("companyNameInput").setValue("");
			this.getView().byId("streetNameInput").setValue("");
			this.getView().byId("houseNumberInput").setValue("");
			this.getView().byId("zipCodeInput").setValue("");
			this.getView().byId("cityNameInput").setValue("");
			
			this.getView().byId("firstNameInput").setValue("");
			this.getView().byId("lastNameInput").setValue("");
			this.getView().byId("phoneNumberInput").setValue("");
		},
	});
});