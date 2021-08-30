sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PurchaseOrderController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, PurchaseOrderController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.purchaseOrder.PurchaseOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("purchaseOrderEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query purchase order, material and business partner data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true);
		},
		
		
		/**
		 * Callback function of the queryPurchaseOrders RESTful WebService call in the PurchaseOrderController.
		 */
		queryPurchaseOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				PurchaseOrderController.initializeDatesAsObject(oModel.oData.purchaseOrder);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("purchaseOrderEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "purchaseOrders");
		}
	});
});