sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ProductionOrderController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, ProductionOrderController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.productionOrder.ProductionOrderOverview", {
		formatter: formatter,
		
		
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("productionOrderOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ProductionOrderController.queryProductionOrdersByWebService(this.queryProductionOrdersCallback, this, true);
    	},


		/**
		 * Handles a selection of an icon in the IconTabBar for production order filtering.
		 */
		onFilterSelect: function (oEvent) {
			var	sKey = oEvent.getParameter("key");

			//Values for status query.
			var sOpen = "OPEN";
			var sInProcess = "IN_PROCESS";
			var sFinished = "FINISHED";
			var sCanceled = "CANCELED";

			if (sKey === "All") {
				ProductionOrderController.queryProductionOrdersByWebService(this.queryProductionOrdersCallback, this, true);
			} else if (sKey === "Open") {
				ProductionOrderController.queryProductionOrdersByWebService(this.queryProductionOrdersCallback, this, true, sOpen);
			} else if (sKey === "In_Process") {
				ProductionOrderController.queryProductionOrdersByWebService(this.queryProductionOrdersCallback, this, true, sInProcess);
			} else if (sKey === "Finished") {
				ProductionOrderController.queryProductionOrdersByWebService(this.queryProductionOrdersCallback, this, true, sFinished);
			} else if (sKey === "Canceled") {
				ProductionOrderController.queryProductionOrdersByWebService(this.queryProductionOrdersCallback, this, true, sCanceled);
			}
		},


		/**
		 * Callback function of the queryProductionOrders RESTful WebService call in the ProductionOrderController.
		 */
		queryProductionOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("productionOrderOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "productionOrders");
		},
		
		
		/**
		 * Formatter of the production order status text.
		 */
		orderStatusTextFormatter: function(sStatus) {
			return ProductionOrderController.orderStatusTextFormatter(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the production order status state.
		 */
		orderStatusStateFormatter: function(sStatus) {
			return ProductionOrderController.orderStatusStateFormatter(sStatus);
		},
	});
});