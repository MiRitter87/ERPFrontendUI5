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
			this.getView().setModel(new JSONModel());
			this.getView().byId("businessPartnerComboBox").setSelectedItem(null);
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, true);
    	},
		
		
		/**
		 * Handles the selection of an item in the business partner ComboBox.
		 */
		onBusinessPartnerSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oBusinessPartners = oModel.oData.businessPartners;
			var oBusinessPartner;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected business partner from the array of all business partners according to the id.
			for(var i = 0; i < oBusinessPartners.data.businessPartner.length; i++) {
    			var oTempBusinessPartner = oBusinessPartners.data.businessPartner[i];
    			
				if(oTempBusinessPartner.id == oSelectedItem.getKey()) {
					oBusinessPartner = oTempBusinessPartner;
				}
			}
			
			//Set the model of the view according to the selected business partner to allow binding of the UI elements.
			oModel.setData({selectedBusinessPartner : oBusinessPartner}, true);
		},
		
		
		/**
		 * Callback function of the queryBusinessPartners RESTful WebService call in the BusinessPartnerController.
		 */
		queryBusinessPartnersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = oCallingController.getView().getModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			oModel.setData({businessPartners : oReturnData}, true);
			
			if(oReturnData.data != null) {
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("businessPartnerDisplay.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(data.message[0].text);
			}                                                          
	
			oCallingController.getView().setModel(oModel);
		}
	});
});