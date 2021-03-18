sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./BusinessPartnerController"
], function (Controller, MessageToast, MessageBox, JSONModel, BusinessPartnerController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.businessPartner.BusinessPartnerOverview", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("businessPartnerOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query business partner data every time a user navigates to this view. This assures that changes are being displayed in the table.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, true);
    	},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isBusinessPartnerSelected() == false) {
				MessageBox.error(oResourceBundle.getText("businessPartnerOverview.noBpSelected"));
				return;
			}
			
			BusinessPartnerController.deleteBusinessPartnerByWebService(this.getSelectedBusinessPartner(), this.deleteBusinessPartnerCallback, this);
		},
		
		
		/**
		 * Checks if a business partner has been selected.
		 */
		isBusinessPartnerSelected : function () {
			if(this.getView().byId("businessPartnerTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected business partner.
		 */
		getSelectedBusinessPartner : function () {
			var oListItem = this.getView().byId("businessPartnerTable").getSelectedItem();
			var oContext = oListItem.getBindingContext();
			var oSelectedBusinessPartner = oContext.getProperty(null, oContext);
			
			return oSelectedBusinessPartner;
		},
		
		
		/**
		 * Callback function of the queryBusinessPartners RESTful WebService call in the BusinessPartnerController.
		 */
		queryBusinessPartnersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			oModel.setData({businessPartners : oReturnData});
			
			if(oReturnData.data != null) {
				if(bShowSuccessMessage == true) {
					MessageToast.show(oResourceBundle.getText("businessPartnerOverview.dataLoaded"));
				}					
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}

			oCallingController.getView().setModel(oModel);
		},
		
		
		/**
		 * Callback function of the deleteBusinessPartner RESTful WebService call in the BusinessPartnerController.
		 */
		deleteBusinessPartnerCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					BusinessPartnerController.queryBusinessPartnersByWebService(oCallingController.queryBusinessPartnersCallback, oCallingController, false);
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