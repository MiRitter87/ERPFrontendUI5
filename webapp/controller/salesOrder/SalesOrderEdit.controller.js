sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./SalesOrderController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, SalesOrderController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("salesOrderEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query sales order data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			SalesOrderController.querySalesOrdersByWebService(this.querySalesOrdersCallback, this, true);
    	},


		/**
		 * Callback function of the queryMaterial RESTful WebService call in the MaterialController.
		 */
		querySalesOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("salesOrderEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "salesOrders");
		}
	});
});