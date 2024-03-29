sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"./BusinessPartnerController"
], function (Controller, JSONModel, MessageToast, BusinessPartnerController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.businessPartner.BusinessPartnerDisplay", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("businessPartnerDisplayRoute").attachMatched(this._onRouteMatched, this);
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
			
			this.setLocalizedTypes();
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
					MessageToast.show(oResourceBundle.getText("businessPartnerDisplay.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(data.message[0].text);
			}                                                          
	
			oCallingController.getView().setModel(oModel, "businessPartners");
		},
		
		
		/**
		 * Determines and sets the localized text of the selected business partners types.
		 */
		setLocalizedTypes : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModel = this.getView().getModel("selectedBusinessPartner");
			var sTypesText = "";
			var aTypes;
			
			//1. Get the types of the selected employee.
			if(oModel != null)
				aTypes = oModel.getProperty("/types");
			
			//2. Determine the localized text of the each type and build a concatenated string.
			sTypesText = BusinessPartnerController.getLocalizedTypesString(aTypes, oResourceBundle);
			
			//3. Apply the text to the type label.
			this.getView().byId("typeText").setText(sTypesText);
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("businessPartnerComboBox").setSelectedItem(null);
			
			this.getView().byId("typeText").setText("");
			this.getView().byId("idText").setText("");

			this.getView().byId("companyNameText").setText("");
			this.getView().byId("streetNameText").setText("");
			this.getView().byId("houseNumberText").setText("");
			this.getView().byId("zipCodeText").setText("");
			this.getView().byId("cityNameText").setText("");
			
			this.getView().byId("firstNameText").setText("");
			this.getView().byId("lastNameText").setText("");
			this.getView().byId("phoneNumberText").setText("");
		}
	});
});