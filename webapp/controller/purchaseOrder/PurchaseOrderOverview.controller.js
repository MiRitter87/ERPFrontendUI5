sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PurchaseOrderController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, PurchaseOrderController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.purchaseOrder.PurchaseOrderOverview", {
		formatter: formatter,
		
		
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("purchaseOrderOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true);
    	},


		/**
		 * Formatter of the purchase order detail status text.
		 */
		detailStatusTextFormatter: function(aStatus) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(aStatus == null)
				return "";

			return PurchaseOrderController.getDetailStatusText(aStatus, oResourceBundle);
		},


		/**
		 * Formatter of the purchase order total status text.
		 */
		totalStatusTextFormatter: function(aStatus) {
			return PurchaseOrderController.totalStatusTextFormatter(aStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},


		/**
		 * Formatter of the purchase order total status state.
		 */
		totalStatusStateFormatter: function(aStatus) {
			return PurchaseOrderController.totalStatusStateFormatter(aStatus);
		},


		/**
		 * Callback function of the queryPurchaseOrder RESTful WebService call in the PurchaseOrderController.
		 */
		queryPurchaseOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("purchaseOrderOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "purchaseOrders");
		}
	});
});