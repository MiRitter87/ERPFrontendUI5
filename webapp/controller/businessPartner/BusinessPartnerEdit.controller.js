sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"./BusinessPartnerController"
], function (Controller, JSONModel, MessageToast, MessageBox, BusinessPartnerController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.businessPartner.BusinessPartnerEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("businessPartnerEditRoute").attachMatched(this._onRouteMatched, this);
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
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("businessPartnerComboBox").getSelectedKey() == "") {
				var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("businessPartnerEdit.noBusinessPartnerSelected"));
				return;
			}
				
			BusinessPartnerController.saveBusinessPartnerByWebService(new JSONModel(this.getView().getModel().getProperty("/selectedBusinessPartner")),
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
					MessageToast.show(oResourceBundle.getText("businessPartnerEdit.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(data.message[0].text);
			}                                                          
	
			oCallingController.getView().setModel(oModel);
		},
		
		
		/**
		 *  Callback function of the saveBusinessPartner RESTful WebService call in the BusinessPartnerController.
		 */
		saveBusinessPartnerCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new business partner data.
					BusinessPartnerController.queryBusinessPartnersByWebService(oCallingController.queryBusinessPartnersCallback, oCallingController, false);
					//Clear ComboBox preventing display of wrong data (Id - Name).
					oCallingController.getView().byId("businessPartnerComboBox").setSelectedKey(null);
					//Clear selectedBusinessPartner because no ComboBox item is selected.
					oCallingController.getView().getModel().setProperty("/selectedBusinessPartner", null);
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
		}
	});
});