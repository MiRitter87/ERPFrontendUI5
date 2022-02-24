sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ProductionOrderController",
	"../MainController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, ProductionOrderController, MainController, formatter, JSONModel, MessageToast, MessageBox) {
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
		 * Handles the press-event of the show details button.
		 */
		onShowDetailsPressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oSelectedProductionOrderModel;
			
			if(this.isProductionOrderSelected() == false) {
				MessageBox.error(oResourceBundle.getText("productionOrderOverview.noProductionOrderSelected"));
				return;
			}
			
			oSelectedProductionOrderModel = new JSONModel();
			oSelectedProductionOrderModel.setData(this.getSelectedProductionOrder());
			this.getView().setModel(oSelectedProductionOrderModel, "selectedProductionOrder");		
			
			MainController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.productionOrder.ProductionOrderOverviewDetails");
		},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isProductionOrderSelected() == false) {
				MessageBox.error(oResourceBundle.getText("productionOrderOverview.noProductionOrderSelected"));
				return;
			}
			
			ProductionOrderController.deleteProductionOrderByWebService(this.getSelectedProductionOrder(), this.deleteProductionOrderCallback, this);
		},
		
		
		/**
		 * Handles a click at the close button of the production order details fragment.
		 */
		onCloseDialog : function () {
			this.byId("orderDetailsDialog").close();
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
		 * Callback function of the deleteProductionOrder RESTful WebService call in the ProductionOrderController.
		 */
		deleteProductionOrderCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					ProductionOrderController.queryProductionOrdersByWebService(oCallingController.queryProductionOrdersCallback, oCallingController, false);
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
		
		
		/**
		 * Checks if a production order has been selected.
		 */
		isProductionOrderSelected : function () {
			if(this.getView().byId("productionOrderTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected production order.
		 */
		getSelectedProductionOrder : function () {
			var oListItem = this.getView().byId("productionOrderTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("productionOrders");
			var oSelectedProductionOrder = oContext.getProperty(null, oContext);
			
			return oSelectedProductionOrder;
		}
	});
});